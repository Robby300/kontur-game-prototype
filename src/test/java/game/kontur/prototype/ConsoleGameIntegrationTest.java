package game.kontur.prototype;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

import game.kontur.prototype.cli.ConsoleGame;

import static org.assertj.core.api.Assertions.assertThat;

class ConsoleGameIntegrationTest {
    @Test
    void completeWalkthroughPrintsEventsRiskDoctrinePricesSpecialistsAndReplayMenu() {
        String input = String.join("\n",
            "4",
            "1",
            "M>M>R",
            "M>A>R",
            "н",
            "M>A>R",
            "д",
            "2",
            "1",
            "д",
            "4"
        ) + "\n";

        String output = run(input, "--seed", "1703");

        assertThat(output)
            .contains("В убежище 43 человека")
            .contains("пищи осталось на 4 дня")
            .contains("генератор откажет через 48 часов")
            .contains("Кислотный фронт накроет сектор через 6 часов")
            .contains("заперты энергетик Вера и агроном Тимур")
            .contains("Ваша задача — сохранить КОНТУР-7 после отказа генератора.")
            .contains("Спасти всех и получить все ресурсы невозможно.")
            .contains("1. Взломать шлюз силой")
            .contains("4. Разрядить батареи отряда")
            .contains("Результат решения:")
            .contains("Эвакуация завершена.")
            .contains("Ночной проект завершён.")
            .contains("Проверка пути: 2d6: 1 + 1; модификатор 0; сумма 2; окно короткое; корпус STRIZH повреждён")
            .contains("M — закрепить модуль.")
            .contains("A — освободить KROT.")
            .contains("R — начать возвращение.")
            .contains("Неверный порядок. Используйте M, A и R ровно по одному разу.")
            .contains("Выбран порядок: M>A>R")
            .contains("Введите порядок заново.")
            .contains("Судьба экспедиции: Порядок M>A>R разрешён: KROT — на базе, STRIZH — на базе, IGLA — оставлен, модуль — полная / на базе")
            .contains("Цена: Полная мощность и работающая мастерская; IGLA будет потеряна.")
            .contains("Цена: IGLA вернётся; реактор даст ограниченную мощность, мастерская отключится.")
            .contains("3. Отремонтировать дальний сенсор STRIZH")
            .contains("Цена: 1 деталь; проверка пути 2d6 не потребуется")
            .contains("Неизвестно: До проверки неизвестны значения двух кубиков.")
            .doesNotContain("Состояние изменится по показанной цене")
            .doesNotContain("Неизвестная часть отсутствует")
            .contains("Спасённые специалисты: Вера — энергетик, Тимур — агроном.")
            .contains("1. Повторить с тем же seed.")
            .contains("2. Начать с новым seed.")
            .contains("3. Ввести seed.")
            .contains("4. Выйти.")
            .doesNotContain("Exception", "NoSuchElementException", "IllegalArgumentException");

        assertThat(output).doesNotContainPattern("\\b[A-Z]+_[A-Z_]+\\b");

        String beforeContact = output.substring(0, output.indexOf("== Узел-12 =="));
        assertThat(beforeContact).doesNotContain("18 человек", "очистки воды", "Узел-12");
        assertThat(count(output, "Результат решения:")).isEqualTo(5);
        String s4 = output.substring(output.indexOf("== Последствия экспедиции =="), output.indexOf("== Узел-12 =="));
        assertThat(s4).doesNotContain("Риск:", "Неизвестно:");
    }

    @Test
    void operationalSensorPrintsThatNoRollWasRequired() {
        String output = run("1\n1\n", "--seed", "1703");

        assertThat(output)
            .contains("Проверка пути: Сенсор STRIZH исправен: бросок не требуется; окно длинное; корпус исправен")
            .contains("Ввод закрыт. Игра завершена без ошибки.")
            .doesNotContain("Exception", "NoSuchElementException", "IllegalArgumentException");
    }

    @Test
    void closedInputAtFirstChoiceEndsWithoutStackTrace() {
        String output = run("", "--seed", "1703");

        assertThat(output)
            .contains("Ввод закрыт. Игра завершена без ошибки.")
            .doesNotContain("Exception", "NoSuchElementException", "IllegalArgumentException");
    }

    @Test
    void replayWithSameSeedActuallyStartsAnotherSession() {
        String input = String.join("\n",
            "4", "1", "M>A>R", "д", "2", "1", "н",
            "1"
        ) + "\n";

        String output = run(input, "--seed=1703");

        assertThat(count(output, "Seed: 1703")).isEqualTo(2);
        assertThat(output).contains("Ввод закрыт. Игра завершена без ошибки.");
    }

    private String run(String input, String... args) {
        var bytes = new ByteArrayOutputStream();
        try (var output = new PrintStream(bytes, true, StandardCharsets.UTF_8)) {
            new ConsoleGame().run(args, new ByteArrayInputStream(input.getBytes(StandardCharsets.UTF_8)), output);
        }
        return bytes.toString(StandardCharsets.UTF_8);
    }

    private int count(String text, String fragment) {
        return (text.length() - text.replace(fragment, "").length()) / fragment.length();
    }
}
