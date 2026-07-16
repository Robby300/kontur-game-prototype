package game.kontur.prototype.episode;
import java.util.SplittableRandom;
import game.kontur.prototype.domain.EpisodeModels.RiskCheck;
import static game.kontur.prototype.domain.GameTypes.ReturnWindow;
public final class SeededDiceRoller implements DiceRoller { public RiskCheck roll(long seed,int alreadyDrawn,int modifier){var r=new SplittableRandom(seed);for(int i=0;i<alreadyDrawn;i++)r.nextInt(1,7);int a=r.nextInt(1,7),b=r.nextInt(1,7),t=a+b+modifier;return new RiskCheck(a,b,modifier,t,t<=6?ReturnWindow.SHORT:t<=9?ReturnWindow.NORMAL:ReturnWindow.LONG);} }
