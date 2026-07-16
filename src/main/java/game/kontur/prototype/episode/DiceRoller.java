package game.kontur.prototype.episode;
import game.kontur.prototype.domain.EpisodeModels.RiskCheck;
public interface DiceRoller { RiskCheck roll(long seed,int alreadyDrawn,int modifier); }
