package game.kontur.prototype.domain;
import java.util.*;
import static game.kontur.prototype.domain.GameTypes.*;
import static game.kontur.prototype.domain.MachineStates.*;

public record WorldState(int day,int population,FoodStatus foodStatus,int generatorHours,PowerMode powerMode,
 WorkshopStatus workshopStatus,int spareParts,ReactorCondition reactorCondition,ReactorLocation reactorLocation,
 ReactorOutput reactorOutput,Node12Relation node12Relation,KrotState krot,StrizhState strizh,IglaState igla,
 Set<SpecialistId> specialists,Set<WorldFlag> flags,ReturnWindow returnWindow,ContactTiming contactTiming,
 OutcomeFamily outcomeFamily,ShelterProfile shelterProfile) {
 public WorldState { if(day<1||population<0||generatorHours<0||spareParts<0)throw new IllegalArgumentException("Resources cannot be negative"); specialists=Set.copyOf(specialists);flags=Set.copyOf(flags);if(reactorCondition==ReactorCondition.LOST&&(reactorLocation!=ReactorLocation.LOST||reactorOutput!=ReactorOutput.NONE))throw new IllegalArgumentException("Lost reactor invariant"); }
 public static WorldState initial(){return new WorldState(1,43,FoodStatus.FOUR_DAYS,48,PowerMode.FULL,WorkshopStatus.ONLINE,2,ReactorCondition.NONE,ReactorLocation.NONE,ReactorOutput.NONE,Node12Relation.UNKNOWN,new KrotState(MachineLife.OPERATIONAL,MachineLocation.IN_FIELD,KrotActuator.WORN),new StrizhState(MachineLife.OPERATIONAL,MachineLocation.IN_FIELD,StrizhSensor.OPERATIONAL),new IglaState(MachineLife.OPERATIONAL,MachineLocation.IN_FIELD,IglaManipulator.OPERATIONAL),Set.of(),Set.of(),null,null,null,null);}
 public Editor edit(){return new Editor(this);} public boolean allMachinesSaved(){return krot.life()!=MachineLife.LOST&&strizh.life()!=MachineLife.LOST&&igla.life()!=MachineLife.LOST;} public boolean durablePower(){return reactorOutput!=ReactorOutput.NONE||generatorHours>=168;}
 public static final class Editor {
  public int day,population,generatorHours,spareParts;public FoodStatus foodStatus;public PowerMode powerMode;public WorkshopStatus workshopStatus;public ReactorCondition reactorCondition;public ReactorLocation reactorLocation;public ReactorOutput reactorOutput;public Node12Relation node12Relation;public KrotState krot;public StrizhState strizh;public IglaState igla;public Set<SpecialistId> specialists;public Set<WorldFlag> flags;public ReturnWindow returnWindow;public ContactTiming contactTiming;public OutcomeFamily outcomeFamily;public ShelterProfile shelterProfile;
  Editor(WorldState s){day=s.day;population=s.population;foodStatus=s.foodStatus;generatorHours=s.generatorHours;powerMode=s.powerMode;workshopStatus=s.workshopStatus;spareParts=s.spareParts;reactorCondition=s.reactorCondition;reactorLocation=s.reactorLocation;reactorOutput=s.reactorOutput;node12Relation=s.node12Relation;krot=s.krot;strizh=s.strizh;igla=s.igla;specialists=new HashSet<>(s.specialists);flags=new HashSet<>(s.flags);returnWindow=s.returnWindow;contactTiming=s.contactTiming;outcomeFamily=s.outcomeFamily;shelterProfile=s.shelterProfile;}
  public WorldState build(){return new WorldState(day,population,foodStatus,generatorHours,powerMode,workshopStatus,spareParts,reactorCondition,reactorLocation,reactorOutput,node12Relation,krot,strizh,igla,specialists,flags,returnWindow,contactTiming,outcomeFamily,shelterProfile);}
 }
}
