package game.kontur.prototype.cli;

public final class Main {
    private Main() {
    }

    public static void main(String[] args) {
        new ConsoleGame().run(args, System.in, System.out);
    }
}
