package game.kontur.prototype.domain;
import java.util.*;
import static game.kontur.prototype.domain.GameTypes.*;
public final class EpisodeModels {
 private EpisodeModels(){}
 public record HiddenWorldState(boolean node12Exists,int node12Population,boolean waterEmergencyAuthentic){}
 public record EventId(String value){public EventId{if(value==null||value.isBlank())throw new IllegalArgumentException("EventId is blank");}}
 public record DiceRoll(int die1,int die2){public DiceRoll{if(die1<1||die1>6||die2<1||die2>6)throw new IllegalArgumentException("d6 out of range");}}
 public sealed interface PlayerDecision permits ChoiceDecision,DoctrineDecision{}
 public record ChoiceDecision(ChoiceId choiceId)implements PlayerDecision{public ChoiceDecision{Objects.requireNonNull(choiceId);}}
 public record DoctrineDecision(Doctrine doctrine)implements PlayerDecision{public DoctrineDecision{Objects.requireNonNull(doctrine);}}
 public record ChoiceOption(ChoiceId id,String intent,String price,String risk){}
 public record GameEvent(String id,EpisodeStage stage,List<String> publicFacts,List<String> stateChanges,String atmosphericText,String causalText){public GameEvent{publicFacts=List.copyOf(publicFacts);stateChanges=List.copyOf(stateChanges);}}
 public record RiskCheck(int die1,int die2,int modifier,int total,ReturnWindow returnWindow){}
 public record EpisodeSessionState(EpisodeStage stage,WorldState world,HiddenWorldState hidden,long seed,int randomDrawCount,List<PlayerDecision> decisions,List<GameEvent> events,RiskCheck riskCheck){public EpisodeSessionState{decisions=List.copyOf(decisions);events=List.copyOf(events);}}
 public record TransitionResult(EpisodeSessionState session,List<GameEvent> events){public TransitionResult{Objects.requireNonNull(session);events=List.copyOf(events);}}
 public record EpisodeResult(WorldState finalState,ShelterProfile profile,List<GameEvent> events,List<PlayerDecision> decisions,long seed,String atmosphericSummary,String causalSummary){public EpisodeResult{events=List.copyOf(events);decisions=List.copyOf(decisions);}}
 public record EpisodeStep(EpisodeStage stage,String title,String briefing,List<ChoiceOption> choices,boolean doctrineRequired,boolean terminal,EpisodeResult result){public EpisodeStep{choices=List.copyOf(choices);}}
}
