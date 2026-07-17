package game.kontur.prototype.cli;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;
import java.util.SplittableRandom;
import java.util.stream.Collectors;

import game.kontur.prototype.domain.Doctrine;
import game.kontur.prototype.domain.EpisodeModels.ChoiceDecision;
import game.kontur.prototype.domain.EpisodeModels.DoctrineDecision;
import game.kontur.prototype.domain.EpisodeModels.EpisodeResult;
import game.kontur.prototype.domain.EpisodeModels.GameEvent;
import game.kontur.prototype.domain.EpisodeModels.PlayerDecision;
import game.kontur.prototype.domain.EpisodeModels.TransitionResult;
import game.kontur.prototype.episode.EpisodeDirector;

import static game.kontur.prototype.domain.GameTypes.ChoiceId;
import static game.kontur.prototype.domain.GameTypes.EpisodeStage;
import static game.kontur.prototype.domain.GameTypes.OrderCard;
import static game.kontur.prototype.domain.GameTypes.SpecialistId;

public final class ConsoleGame {
    public void run(String[] args, InputStream input, PrintStream output) {
        var in = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8));
        long seed = parseSeed(args, output);
        while (true) {
            if (!play(seed, in, output)) {
                return;
            }
            var replay = readReplayChoice(in, output);
            if (replay.isEmpty() || replay.get() == 4) {
                output.println("Игра завершена.");
                return;
            }
            if (replay.get() == 2) {
                seed = new SplittableRandom(seed).nextLong();
            } else if (replay.get() == 3) {
                var entered = readSeed(in, output);
                if (entered.isEmpty()) {
                    return;
                }
                seed = entered.get();
            }
        }
    }

    private boolean play(long seed, BufferedReader in, PrintStream out) {
        var director = new EpisodeDirector();
        var session = director.start(seed);
        out.println("КОНТУР v0.3 — Кислотный фронт");
        out.println("Seed: " + seed);

        while (true) {
            var step = director.current(session);
            out.println("\n== " + step.title() + " ==");
            out.println(step.briefing());
            if (step.terminal()) {
                printResult(step.result(), out);
                var reveal = readYesNo(in, out, "Показать причинную цепочку? [д/н]: ");
                if (reveal.isEmpty()) {
                    return false;
                }
                if (reveal.get()) {
                    out.println("\nПричинная цепочка:");
                    out.println(localize(step.result().causalSummary()));
                }
                return true;
            }

            TransitionResult transition;
            if (step.doctrineRequired()) {
                var doctrine = readDoctrine(in, out);
                if (doctrine.isEmpty()) {
                    return false;
                }
                transition = director.decide(session, new DoctrineDecision(doctrine.get()));
            } else {
                printChoices(step.choices(), out);
                var choice = readNumber(in, out, "Ваш выбор: ", 1, step.choices().size());
                if (choice.isEmpty()) {
                    return false;
                }
                transition = director.decide(session, new ChoiceDecision(step.choices().get(choice.get() - 1).id()));
            }
            printEvents(transition.events(), out);
            session = transition.session();
        }
    }

    private void printChoices(java.util.List<game.kontur.prototype.domain.EpisodeModels.ChoiceOption> choices, PrintStream out) {
        for (int i = 0; i < choices.size(); i++) {
            var option = choices.get(i);
            out.printf("%d. %s%n", i + 1, option.intent());
            out.println("   Цена: " + localize(option.price()));
            if (!option.risk().isBlank()) {
                out.println("   Риск: " + localize(option.risk()));
            }
            if (!option.unknownPart().isBlank()) {
                out.println("   Неизвестно: " + localize(option.unknownPart()));
            }
        }
    }

    private Optional<Doctrine> readDoctrine(BufferedReader in, PrintStream out) {
        out.println("M — закрепить модуль.");
        out.println("A — освободить KROT.");
        out.println("R — начать возвращение.");
        while (true) {
            var line = readLine(in, out, "Введите порядок M, A и R (например M>A>R): ");
            if (line.isEmpty()) {
                return Optional.empty();
            }
            var doctrine = parseDoctrine(line.get());
            if (doctrine.isEmpty()) {
                out.println("Неверный порядок. Используйте M, A и R ровно по одному разу.");
                continue;
            }
            out.println("Выбран порядок: " + doctrine.get());
            var confirmed = readYesNo(in, out, "Подтвердить этот порядок? [д/н]: ");
            if (confirmed.isEmpty()) {
                return Optional.empty();
            }
            if (confirmed.get()) {
                return doctrine;
            }
            out.println("Введите порядок заново.");
        }
    }

    private Optional<Doctrine> parseDoctrine(String value) {
        try {
            var cards = Arrays.stream(value.trim().toUpperCase(Locale.ROOT).split(">"))
                .map(String::trim)
                .map(OrderCard::valueOf)
                .toArray(OrderCard[]::new);
            return Optional.of(Doctrine.of(cards));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    private void printEvents(java.util.List<GameEvent> events, PrintStream out) {
        out.println("\nРезультат решения:");
        for (var event : events) {
            out.println("- " + event.atmosphericText());
            if (event.stage() == EpisodeStage.REACTOR_ROUTE) {
                out.println("  Проверка пути: " + localize(event.causalText()));
            } else if (event.stage() == EpisodeStage.DOCTRINE_CRISIS) {
                out.println("  Судьба экспедиции: " + localize(event.causalText()));
            } else {
                out.println("  " + localize(event.causalText()));
            }
        }
    }

    private void printResult(EpisodeResult result, PrintStream out) {
        var world = result.finalState();
        out.println("\nИтог: профиль — " + localize(result.profile().name())
            + ", население — " + world.population()
            + ", пища — " + localize(world.foodStatus().name())
            + ", энергия — " + localize(world.powerMode().name())
            + ", мастерская — " + localize(world.workshopStatus().name())
            + ", реактор — " + localize(world.reactorOutput().name())
            + ", Узел-12 — " + localize(world.node12Relation().name()));
        var specialists = world.specialists().isEmpty()
            ? "нет"
            : world.specialists().stream().sorted().map(this::specialistName).collect(Collectors.joining(", "));
        out.println("Спасённые специалисты: " + specialists + ".");
        out.println("KROT: " + localize(world.krot().life().name()) + ", " + localize(world.krot().location().name()) + ", привод " + localize(world.krot().actuator().name()));
        out.println("STRIZH: " + localize(world.strizh().life().name()) + ", " + localize(world.strizh().location().name()) + ", сенсор " + localize(world.strizh().sensor().name()));
        out.println("IGLA: " + localize(world.igla().life().name()) + ", " + localize(world.igla().location().name()) + ", манипулятор " + localize(world.igla().manipulator().name()));
        out.println("Решения: " + result.decisions().stream().map(this::decisionText).toList() + "; seed=" + result.seed());
    }

    private String specialistName(SpecialistId id) {
        return switch (id) {
            case VERA -> "Вера — энергетик";
            case TIMUR -> "Тимур — агроном";
        };
    }

    private String decisionText(PlayerDecision decision) {
        return decision instanceof DoctrineDecision doctrine
            ? doctrine.doctrine().toString()
            : choiceText(((ChoiceDecision) decision).choiceId());
    }

    private Optional<Integer> readReplayChoice(BufferedReader in, PrintStream out) {
        out.println("\nЧто дальше?");
        out.println("1. Повторить с тем же seed.");
        out.println("2. Начать с новым seed.");
        out.println("3. Ввести seed.");
        out.println("4. Выйти.");
        return readNumber(in, out, "Ваш выбор: ", 1, 4);
    }

    private Optional<Long> readSeed(BufferedReader in, PrintStream out) {
        while (true) {
            var line = readLine(in, out, "Введите seed: ");
            if (line.isEmpty()) {
                return Optional.empty();
            }
            try {
                return Optional.of(Long.parseLong(line.get().trim()));
            } catch (NumberFormatException exception) {
                out.println("Seed должен быть целым числом.");
            }
        }
    }

    private Optional<Integer> readNumber(BufferedReader in, PrintStream out, String prompt, int min, int max) {
        while (true) {
            var line = readLine(in, out, prompt);
            if (line.isEmpty()) {
                return Optional.empty();
            }
            try {
                int value = Integer.parseInt(line.get().trim());
                if (value >= min && value <= max) {
                    return Optional.of(value);
                }
            } catch (NumberFormatException ignored) {
            }
            out.println("Введите число от " + min + " до " + max + ".");
        }
    }

    private Optional<Boolean> readYesNo(BufferedReader in, PrintStream out, String prompt) {
        while (true) {
            var line = readLine(in, out, prompt);
            if (line.isEmpty()) {
                return Optional.empty();
            }
            var normalized = line.get().trim().toLowerCase(Locale.ROOT);
            if (normalized.equals("д") || normalized.equals("да") || normalized.equals("y") || normalized.equals("yes")) {
                return Optional.of(true);
            }
            if (normalized.equals("н") || normalized.equals("нет") || normalized.equals("n") || normalized.equals("no")) {
                return Optional.of(false);
            }
            out.println("Ответьте «д» или «н».");
        }
    }

    private Optional<String> readLine(BufferedReader in, PrintStream out, String prompt) {
        out.print(prompt);
        try {
            var line = in.readLine();
            if (line == null) {
                out.println("\nВвод закрыт. Игра завершена без ошибки.");
                return Optional.empty();
            }
            return Optional.of(line);
        } catch (IOException exception) {
            out.println("\nНе удалось прочитать ввод. Игра завершена без изменения состояния.");
            return Optional.empty();
        }
    }

    private long parseSeed(String[] args, PrintStream out) {
        for (int i = 0; i < args.length; i++) {
            String value = null;
            if (args[i].equals("--seed") && i + 1 < args.length) {
                value = args[i + 1];
            } else if (args[i].startsWith("--seed=")) {
                value = args[i].substring(7);
            }
            if (value != null) {
                try {
                    return Long.parseLong(value);
                } catch (NumberFormatException exception) {
                    out.println("Некорректный seed в аргументах; используется 1703.");
                    return 1703L;
                }
            }
        }
        return 1703L;
    }

    private String choiceText(ChoiceId id) {
        return switch (id) {
            case BREAK_GATE -> "сломать шлюз";
            case TECH_CHANNEL_VERA -> "вывести Веру";
            case TECH_CHANNEL_TIMUR -> "вывести Тимура";
            case DISCHARGE_BATTERIES -> "разрядить батареи";
            case START_GREENHOUSE -> "запустить теплицу";
            case PATCH_GENERATOR -> "залатать генератор";
            case REPAIR_STRIZH_SENSOR -> "починить сенсор STRIZH";
            case REPAIR_KROT_ACTUATOR -> "починить привод KROT";
            case CONSERVE_PARTS -> "сберечь детали";
            case INSTALL_FULL_POWER -> "запустить полную мощность";
            case POWER_RESCUE_BEACON -> "питать спасательный маяк";
            case SEND_KROT_FOR_IGLA -> "отправить KROT за IGLA";
            case RECOVER_KROT_AND_MODULE -> "вернуть KROT и модуль";
            case RECOVER_MODULE_ONLY -> "вернуть модуль";
            case ABANDON_REACTOR_SITE -> "оставить реакторный сектор";
            case INSTALL_LIMITED_MODULE -> "установить ограниченный модуль";
            case DISASSEMBLE_MODULE -> "разобрать модуль";
            case OFFER_MODULE_FOR_TRADE -> "предложить модуль для обмена";
            case ACCEPT_AUSTERITY -> "принять экономию";
            case CANNIBALIZE_KROT -> "разобрать KROT";
            case BROADCAST_FOR_HELP -> "просить о помощи";
            case RESCUE_KROT_WITH_IGLA -> "спасти KROT с IGLA";
            case ABANDON_KROT -> "оставить KROT";
            case REQUEST_EXTERNAL_RESCUE -> "запросить эвакуацию";
            case SEND_GREENHOUSE_CULTURES -> "передать культуры";
            case SHARE_REACTOR_POWER -> "поделиться энергией";
            case TRADE_DEGRADED_MODULE -> "обменять модуль";
            case SEND_IGLA_TO_NODE12 -> "отправить IGLA в Узел-12";
            case IGNORE_NODE12 -> "игнорировать Узел-12";
        };
    }

    private String localize(String text) {
        var result = text;
        for (var id : ChoiceId.values()) {
            result = result.replace(id.name(), choiceText(id));
        }
        result = result.replace("NODE12", "Узел-12")
            .replace("SHORT", "короткое")
            .replace("NORMAL", "обычное")
            .replace("LONG", "длинное")
            .replace("EARLY", "ранний")
            .replace("LATE", "поздний");
        return result.replace("FULL_MODULE_IGLA_STRANDED", "полный модуль, IGLA оставлена")
            .replace("KROT_AND_MODULE_STRANDED", "KROT и модуль оставлены")
            .replace("DEGRADED_MODULE_ALL_RETURNED", "повреждённый модуль, все вернулись")
            .replace("ALL_RETURNED_MODULE_LOST", "все вернулись, модуль потерян")
            .replace("KROT_STRANDED_MODULE_LOST", "KROT оставлен, модуль потерян")
            .replace("matched=true", "сработал")
            .replace("matched=false", "не сработал")
            .replace("AGRARIAN_ALLIANCE", "аграрный союз")
            .replace("INDUSTRIAL_HUB", "промышленный узел")
            .replace("POWERED_STRONGHOLD", "энергетическая крепость")
            .replace("MOBILE_COMMUNE", "мобильная коммуна")
            .replace("DEPENDENT_NETWORK", "зависимая сеть")
            .replace("AUSTERITY_ENCLAVE", "анклав экономии")
            .replace("SURVIVAL_OUTPOST", "форпост выживания")
            .replace("RATIONED_TWO_DAYS", "паёк на два дня")
            .replace("SUSTAINABLE", "устойчивая")
            .replace("THREE_DAYS", "на три дня")
            .replace("FOUR_DAYS", "на четыре дня")
            .replace("OPERATIONAL", "исправен")
            .replace("DAMAGED", "повреждён")
            .replace("BURNED", "сгорел")
            .replace("WORN", "изношен")
            .replace("CRIPPLED", "неработоспособен")
            .replace("AT_BASE", "на базе")
            .replace("IN_FIELD", "в секторе")
            .replace("AWAY", "в пути")
            .replace("STRANDED", "оставлен")
            .replace("LOST", "потерян")
            .replace("LIMITED", "ограниченная")
            .replace("EMERGENCY", "аварийная")
            .replace("FULL", "полная")
            .replace("NONE", "нет")
            .replace("OFFLINE", "отключена")
            .replace("ONLINE", "работает")
            .replace("ALLY", "союз")
            .replace("COOPERATIVE", "сотрудничество")
            .replace("SILENT", "молчание")
            .replace("UNKNOWN", "неизвестно");
    }
}
