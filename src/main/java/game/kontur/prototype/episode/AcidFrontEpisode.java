package game.kontur.prototype.episode;

import java.util.*;
import game.kontur.prototype.domain.*;
import game.kontur.prototype.domain.EpisodeModels.*;
import static game.kontur.prototype.domain.GameTypes.*;
import static game.kontur.prototype.domain.MachineStates.*;

public final class AcidFrontEpisode {
 private final DiceRoller dice;
 public AcidFrontEpisode(){this(new SeededDiceRoller());}
 public AcidFrontEpisode(DiceRoller dice){this.dice=Objects.requireNonNull(dice);}
 public EpisodeSessionState start(long seed){return new EpisodeSessionState(EpisodeStage.RESCUE_GATE,WorldState.initial(),new HiddenWorldState(true,18,true),seed,0,List.of(),List.of(),null);}

 public EpisodeStep current(EpisodeSessionState s){
  var w=s.world();
  return switch(s.stage()){
   case RESCUE_GATE->step(s,"Эвакуационный шлюз","Ваша задача — сохранить КОНТУР-7 после отказа генератора. Спасти всех и получить все ресурсы невозможно. В убежище 43 человека, пищи осталось на 4 дня, главный генератор откажет через 48 часов. Кислотный фронт накроет сектор через 6 часов. На станции эвакуации заперты энергетик Вера и агроном Тимур; отряд KROT, STRIZH и IGLA уже у шлюза.",s1(),false);
   case NIGHT_PROJECT->step(s,"Ночной проект","До выхода к реактору можно завершить ровно один проект. Прямые цены показаны заранее.",s2(w),false);
   case REACTOR_ROUTE->throw new IllegalStateException("REACTOR_ROUTE resolves atomically after S2");
   case DOCTRINE_CRISIS->step(s,"Доктрина экспедиции","Крепления модуля разрушаются, привод KROT заблокирован, заряд достиг порога возвращения. Упорядочьте M, A и R.",List.of(),true);
   case CONSEQUENCE->step(s,"Последствия экспедиции","Выберите, какую цену база заплатит за фактический исход экспедиции.",s4(w),false);
   case NODE12_CONTACT->step(s,"Узел-12","Получен подлинный сигнал: 18 человек, работающая мастерская и отказ очистки воды. До аварии осталось "+(w.contactTiming()==ContactTiming.EARLY?"36":"12")+" часов.",s5(w),false);
   case EPILOGUE->terminal(s);
  };
 }
 private EpisodeStep step(EpisodeSessionState s,String title,String text,List<ChoiceOption> choices,boolean doctrine){return new EpisodeStep(s.stage(),title,text,choices,doctrine,false,null);}
 private ChoiceOption o(ChoiceId id,String intent,String price){return new ChoiceOption(id,intent,price,"","");}
 private ChoiceOption o(ChoiceId id,String intent,String price,String risk,String unknown){return new ChoiceOption(id,intent,price,risk,unknown);}
 private List<ChoiceOption>s1(){return List.of(o(ChoiceId.BREAK_GATE,"Взломать шлюз силой","Спасти Веру и Тимура; повредить привод KROT"),o(ChoiceId.TECH_CHANNEL_VERA,"Вывести только Веру","Тимур будет потерян; машины сохранятся"),o(ChoiceId.TECH_CHANNEL_TIMUR,"Вывести только Тимура","Вера будет потеряна; машины сохранятся"),o(ChoiceId.DISCHARGE_BATTERIES,"Разрядить батареи отряда","Спасти Веру и Тимура; сжечь сенсор STRIZH"));}
 private List<ChoiceOption>s2(WorldState w){
  var r=new ArrayList<ChoiceOption>();
  if(w.specialists().contains(SpecialistId.TIMUR)&&w.spareParts()>=1)r.add(s2Option(ChoiceId.START_GREENHOUSE,"Запустить теплицу","1 деталь и 6 часов генератора",w));
  if(w.specialists().contains(SpecialistId.VERA)&&w.spareParts()>=1)r.add(s2Option(ChoiceId.PATCH_GENERATOR,"Залатать генератор","1 деталь",w));
  if(w.strizh().sensor()==StrizhSensor.BURNED&&w.spareParts()>=1)r.add(s2Option(ChoiceId.REPAIR_STRIZH_SENSOR,"Отремонтировать дальний сенсор STRIZH","1 деталь; проверка пути 2d6 не потребуется",w));
  if(w.krot().actuator()==KrotActuator.DAMAGED&&w.spareParts()>=1)r.add(s2Option(ChoiceId.REPAIR_KROT_ACTUATOR,"Починить привод KROT","1 деталь",w));
  r.add(s2Option(ChoiceId.CONSERVE_PARTS,"Сберечь детали","Ночной проект не выполнен",w));
  return List.copyOf(r);
 }
 private ChoiceOption s2Option(ChoiceId id,String intent,String price,WorldState w){
  if(w.strizh().sensor()!=StrizhSensor.BURNED||id==ChoiceId.REPAIR_STRIZH_SENSOR)return o(id,intent,price);
  String modifier=id==ChoiceId.CONSERVE_PARTS?" Подготовка даст модификатор +1.":" Модификатор подготовки будет 0.";
  return o(id,intent,price,"Сгоревший сенсор вызовет проверку пути 2d6."+modifier,"До проверки неизвестны значения двух кубиков.");
 }
 private List<ChoiceOption>s4(WorldState w){var ids=switch(w.outcomeFamily()){
   case FULL_MODULE_IGLA_STRANDED->w.returnWindow()==ReturnWindow.SHORT?List.of(ChoiceId.INSTALL_FULL_POWER,ChoiceId.POWER_RESCUE_BEACON):List.of(ChoiceId.INSTALL_FULL_POWER,ChoiceId.POWER_RESCUE_BEACON,ChoiceId.SEND_KROT_FOR_IGLA);
   case KROT_AND_MODULE_STRANDED->w.returnWindow()==ReturnWindow.SHORT?List.of(ChoiceId.RECOVER_MODULE_ONLY,ChoiceId.ABANDON_REACTOR_SITE):List.of(ChoiceId.RECOVER_KROT_AND_MODULE,ChoiceId.RECOVER_MODULE_ONLY,ChoiceId.ABANDON_REACTOR_SITE);
   case DEGRADED_MODULE_ALL_RETURNED->List.of(ChoiceId.INSTALL_LIMITED_MODULE,ChoiceId.DISASSEMBLE_MODULE,ChoiceId.OFFER_MODULE_FOR_TRADE);
   case ALL_RETURNED_MODULE_LOST->List.of(ChoiceId.ACCEPT_AUSTERITY,ChoiceId.CANNIBALIZE_KROT,ChoiceId.BROADCAST_FOR_HELP);
   case KROT_STRANDED_MODULE_LOST->w.returnWindow()==ReturnWindow.SHORT?List.of(ChoiceId.ABANDON_KROT,ChoiceId.REQUEST_EXTERNAL_RESCUE):List.of(ChoiceId.RESCUE_KROT_WITH_IGLA,ChoiceId.ABANDON_KROT,ChoiceId.REQUEST_EXTERNAL_RESCUE);
  };return ids.stream().map(i->s4Option(i,w)).toList();}
 private String s4Intent(ChoiceId i){return switch(i){case INSTALL_FULL_POWER->"Запустить полную мощность";case POWER_RESCUE_BEACON->"Питать спасательный маяк";case SEND_KROT_FOR_IGLA->"Отправить KROT за IGLA";case RECOVER_KROT_AND_MODULE->"Вернуть KROT и модуль";case RECOVER_MODULE_ONLY->"Вернуть только модуль";case ABANDON_REACTOR_SITE->"Оставить реакторный сектор";case INSTALL_LIMITED_MODULE->"Установить ограниченный модуль";case DISASSEMBLE_MODULE->"Разобрать модуль";case OFFER_MODULE_FOR_TRADE->"Предложить модуль для обмена";case ACCEPT_AUSTERITY->"Принять режим экономии";case CANNIBALIZE_KROT->"Разобрать KROT";case BROADCAST_FOR_HELP->"Передать просьбу о помощи";case RESCUE_KROT_WITH_IGLA->"Вернуть KROT с помощью IGLA";case ABANDON_KROT->"Оставить KROT";case REQUEST_EXTERNAL_RESCUE->"Запросить внешнюю эвакуацию";default->throw new IllegalArgumentException("Not an S4 choice");};}
 private ChoiceOption s4Option(ChoiceId id,WorldState w){String price=switch(id){
  case INSTALL_FULL_POWER->"Полная мощность и работающая мастерская; IGLA будет потеряна.";
  case POWER_RESCUE_BEACON->"IGLA вернётся; реактор даст ограниченную мощность, мастерская отключится.";
  case SEND_KROT_FOR_IGLA->"IGLA вернётся; привод KROT станет "+(w.returnWindow()==ReturnWindow.LONG?"повреждённым":"неработоспособным")+"; мощность будет полной.";
  case RECOVER_KROT_AND_MODULE->"KROT вернётся; модуль станет повреждённым и даст ограниченную мощность; "+(w.returnWindow()==ReturnWindow.LONG?"манипулятор IGLA сохранится":"манипулятор IGLA будет повреждён")+".";
  case RECOVER_MODULE_ONLY->"Полная мощность и работающая мастерская; KROT будет потерян.";
  case ABANDON_REACTOR_SITE->"KROT и реакторный модуль будут потеряны; останется старый генератор.";
  case INSTALL_LIMITED_MODULE->"Ограниченная мощность; мастерская отключится.";
  case DISASSEMBLE_MODULE->"Модуль будет потерян; база получит 168 часов генератора и 2 детали.";
  case OFFER_MODULE_FOR_TRADE->"Повреждённый модуль останется на базе без выработки; будет установлен контакт для обмена.";
  case ACCEPT_AUSTERITY->"Аварийный режим энергии; мастерская отключится.";
  case CANNIBALIZE_KROT->"KROT будет потерян; база получит 168 часов генератора и 2 детали.";
  case BROADCAST_FOR_HELP->"Будет установлен контакт; немедленных ресурсов или ремонта нет.";
  case RESCUE_KROT_WITH_IGLA->"KROT вернётся; "+(w.returnWindow()==ReturnWindow.LONG?"манипулятор IGLA сохранится":"манипулятор IGLA будет повреждён")+"; модуль потерян.";
  case ABANDON_KROT->"KROT и реакторный модуль будут потеряны.";
  case REQUEST_EXTERNAL_RESCUE->"KROT вернётся с неработоспособным приводом; возникнет долг перед внешней группой.";
  default->throw new IllegalArgumentException("Not an S4 choice: "+id);
 };String risk=switch(id){case SEND_KROT_FOR_IGLA,RECOVER_KROT_AND_MODULE,RESCUE_KROT_WITH_IGLA->"Нового броска нет; текущее окно возвращения — "+w.returnWindow()+"; цена уже рассчитана для этого окна.";default->"";};return o(id,s4Intent(id),price,risk,"");}
 private List<ChoiceOption>s5(WorldState w){var r=new ArrayList<ChoiceOption>();if(w.flags().contains(WorldFlag.GREENHOUSE_ACTIVE)&&w.contactTiming()==ContactTiming.EARLY)r.add(o(ChoiceId.SEND_GREENHOUSE_CULTURES,"Передать культуры","Пища станет RATIONED_TWO_DAYS"));if(w.reactorOutput()==ReactorOutput.FULL)r.add(o(ChoiceId.SHARE_REACTOR_POWER,"Поделиться энергией","Мощность станет LIMITED"));if(w.flags().contains(WorldFlag.TRADE_OFFER_SENT)&&w.reactorCondition()==ReactorCondition.DEGRADED&&w.reactorLocation()==ReactorLocation.AT_BASE)r.add(o(ChoiceId.TRADE_DEGRADED_MODULE,"Обменять модуль","Модуль уйдёт в NODE12"));if(w.igla().life()!=MachineLife.LOST&&w.igla().location()==MachineLocation.AT_BASE)r.add(o(ChoiceId.SEND_IGLA_TO_NODE12,"Отправить IGLA","Машина будет AWAY"));r.add(o(ChoiceId.IGNORE_NODE12,"Игнорировать","Отношения станут SILENT"));return List.copyOf(r);}

 EpisodeSessionState decide(EpisodeSessionState s,PlayerDecision d){
  Objects.requireNonNull(s);Objects.requireNonNull(d);if(s.stage()==EpisodeStage.EPILOGUE)throw new IllegalStateException("Episode already ended");
  if(s.stage()==EpisodeStage.DOCTRINE_CRISIS){if(!(d instanceof DoctrineDecision dd))throw new IllegalArgumentException("Doctrine required");return doctrine(s,dd);}
  if(!(d instanceof ChoiceDecision cd))throw new IllegalArgumentException("Choice required");if(current(s).choices().stream().noneMatch(x->x.id()==cd.choiceId()))throw new IllegalArgumentException("Choice is not available: "+cd.choiceId());
  return switch(s.stage()){case RESCUE_GATE->rescue(s,cd);case NIGHT_PROJECT->project(s,cd);case CONSEQUENCE->consequence(s,cd);case NODE12_CONTACT->contact(s,cd);default->throw new IllegalStateException("No decision at "+s.stage());};
 }
 private EpisodeSessionState next(EpisodeSessionState s,EpisodeStage stage,WorldState w,PlayerDecision d,List<GameEvent> added,int draws,RiskCheck risk){var ds=new ArrayList<>(s.decisions());ds.add(d);var es=new ArrayList<>(s.events());es.addAll(added);return new EpisodeSessionState(stage,w,s.hidden(),s.seed(),s.randomDrawCount()+draws,ds,es,risk);}
 private GameEvent event(String id,EpisodeStage stage,List<String> facts,List<String> changes,String causal){String atmosphere=switch(stage){case RESCUE_GATE->"Эвакуация завершена.";case NIGHT_PROJECT->"Ночной проект завершён.";case REACTOR_ROUTE->"Экспедиция достигла реакторного сектора.";case DOCTRINE_CRISIS->"Доктрина определила исход кризиса.";case CONSEQUENCE->"База приняла последствия экспедиции.";case NODE12_CONTACT->"Ответ Узлу-12 передан.";case EPILOGUE->"Эпизод завершён.";};return new GameEvent(id,stage,facts,changes,atmosphere,causal);}
 private EpisodeSessionState rescue(EpisodeSessionState s,ChoiceDecision d){var e=s.world().edit();e.generatorHours-=12;e.foodStatus=FoodStatus.THREE_DAYS;e.krot=e.krot.withLocation(MachineLocation.AT_BASE);e.strizh=e.strizh.withLocation(MachineLocation.AT_BASE);e.igla=e.igla.withLocation(MachineLocation.AT_BASE);switch(d.choiceId()){case BREAK_GATE->{e.specialists.addAll(Set.of(SpecialistId.VERA,SpecialistId.TIMUR));e.krot=e.krot.withActuator(KrotActuator.DAMAGED);}case TECH_CHANNEL_VERA->e.specialists.add(SpecialistId.VERA);case TECH_CHANNEL_TIMUR->e.specialists.add(SpecialistId.TIMUR);case DISCHARGE_BATTERIES->{e.specialists.addAll(Set.of(SpecialistId.VERA,SpecialistId.TIMUR));e.strizh=e.strizh.withSensor(StrizhSensor.BURNED);e.flags.add(WorldFlag.BATTERIES_DISCHARGED);}default->throw new AssertionError();}e.population=e.specialists.size()==2?45:44;var ev=event("S1_"+d.choiceId(),EpisodeStage.RESCUE_GATE,List.of("Кислотный фронт у шлюза"),List.of("population="+e.population,"generatorHours="+e.generatorHours),"Выбрано "+d.choiceId()+"; эвакуация завершена");return next(s,EpisodeStage.NIGHT_PROJECT,e.build(),d,List.of(ev),0,null);}
 private EpisodeSessionState project(EpisodeSessionState s,ChoiceDecision d){
  var e=s.world().edit();
  switch(d.choiceId()){
   case START_GREENHOUSE->{e.foodStatus=FoodStatus.SUSTAINABLE;e.spareParts--;e.generatorHours-=6;e.flags.add(WorldFlag.GREENHOUSE_ACTIVE);}
   case PATCH_GENERATOR->{e.generatorHours+=48;e.spareParts--;e.flags.add(WorldFlag.GENERATOR_PATCHED);}
   case REPAIR_STRIZH_SENSOR->{e.strizh=e.strizh.withSensor(StrizhSensor.OPERATIONAL);e.spareParts--;}
   case REPAIR_KROT_ACTUATOR->{e.krot=e.krot.withActuator(KrotActuator.WORN);e.spareParts--;}
   case CONSERVE_PARTS->e.flags.add(WorldFlag.PARTS_CONSERVED);
   default->throw new AssertionError();
  }
  e.day=2;
  RiskCheck risk=null;
  int draws=0;
  if(e.strizh.sensor()==StrizhSensor.OPERATIONAL)e.returnWindow=ReturnWindow.LONG;
  else{
   int mod=e.flags.contains(WorldFlag.PARTS_CONSERVED)?1:0;
   risk=dice.roll(s.seed(),s.randomDrawCount(),mod);
   draws=2;
   e.returnWindow=risk.returnWindow();
   if(risk.total()<=9)e.strizh=e.strizh.withLife(MachineLife.DAMAGED);
  }
  e.krot=e.krot.withLocation(MachineLocation.IN_FIELD);
  e.strizh=e.strizh.withLocation(MachineLocation.IN_FIELD);
  e.igla=e.igla.withLocation(MachineLocation.IN_FIELD);
  var events=new ArrayList<GameEvent>();
  events.add(event("S2_"+d.choiceId(),EpisodeStage.NIGHT_PROJECT,List.of("Доступен один ночной проект"),List.of("day=2","spareParts="+e.spareParts),"Выполнено "+d.choiceId()));
  List<String> routeChanges;
  String routeCausal;
  if(risk==null){
   routeChanges=List.of("riskCheck=NOT_REQUIRED","returnWindow="+e.returnWindow,"STRIZH.life="+e.strizh.life());
   routeCausal="Сенсор STRIZH исправен: бросок не требуется; окно "+e.returnWindow+"; корпус "+e.strizh.life();
  }else{
   routeChanges=List.of("die1="+risk.die1(),"die2="+risk.die2(),"modifier="+risk.modifier(),"total="+risk.total(),"returnWindow="+e.returnWindow,"STRIZH.life="+e.strizh.life());
   routeCausal="2d6: "+risk.die1()+" + "+risk.die2()+"; модификатор "+risk.modifier()+"; сумма "+risk.total()+"; окно "+risk.returnWindow()+"; корпус STRIZH "+e.strizh.life();
  }
  events.add(event("S3_ROUTE",EpisodeStage.REACTOR_ROUTE,List.of("Сенсор STRIZH: "+e.strizh.sensor()),routeChanges,routeCausal));
  return next(s,EpisodeStage.DOCTRINE_CRISIS,e.build(),d,events,draws,risk);
 }
 private record DoctrineResolution(OutcomeFamily family,List<String> evaluations){}
 private DoctrineResolution resolveDoctrine(Doctrine doctrine){boolean returned=false,moduleSecured=false,krotFreed=false,moduleDegraded=false,iglaStranded=false;var log=new ArrayList<String>();for(var card:doctrine.cards()){boolean matched=switch(card){case M->!returned&&!moduleSecured;case A->!returned&&!krotFreed;case R->!returned;};log.add(card+" matched="+matched);if(!matched)continue;switch(card){case M->{moduleSecured=true;moduleDegraded=krotFreed;}case A->{krotFreed=true;if(moduleSecured&&!moduleDegraded)iglaStranded=true;}case R->returned=true;}}OutcomeFamily family;if(moduleSecured&&iglaStranded)family=OutcomeFamily.FULL_MODULE_IGLA_STRANDED;else if(moduleSecured&&!krotFreed)family=OutcomeFamily.KROT_AND_MODULE_STRANDED;else if(moduleSecured)family=OutcomeFamily.DEGRADED_MODULE_ALL_RETURNED;else if(krotFreed)family=OutcomeFamily.ALL_RETURNED_MODULE_LOST;else family=OutcomeFamily.KROT_STRANDED_MODULE_LOST;return new DoctrineResolution(family,List.copyOf(log));}
 private EpisodeSessionState doctrine(EpisodeSessionState s,DoctrineDecision d){
  var e=s.world().edit();
  String doctrine=d.doctrine().toString();
  var resolution=resolveDoctrine(d.doctrine());
  e.outcomeFamily=resolution.family();
  switch(e.outcomeFamily){
   case FULL_MODULE_IGLA_STRANDED->{e.reactorCondition=ReactorCondition.FULL;e.reactorLocation=ReactorLocation.AT_BASE;e.krot=e.krot.withLocation(MachineLocation.AT_BASE);e.strizh=e.strizh.withLocation(MachineLocation.AT_BASE);e.igla=e.igla.withLocation(MachineLocation.STRANDED);}
   case KROT_AND_MODULE_STRANDED->{e.reactorCondition=ReactorCondition.FULL;e.reactorLocation=ReactorLocation.STRANDED;e.krot=e.krot.withLocation(MachineLocation.STRANDED);e.strizh=e.strizh.withLocation(MachineLocation.AT_BASE);e.igla=e.igla.withLocation(MachineLocation.AT_BASE);}
   case DEGRADED_MODULE_ALL_RETURNED->{e.reactorCondition=ReactorCondition.DEGRADED;e.reactorLocation=ReactorLocation.AT_BASE;atBase(e);}
   case ALL_RETURNED_MODULE_LOST->{lostReactor(e);atBase(e);}
   case KROT_STRANDED_MODULE_LOST->{lostReactor(e);e.krot=e.krot.withLocation(MachineLocation.STRANDED);e.strizh=e.strizh.withLocation(MachineLocation.AT_BASE);e.igla=e.igla.withLocation(MachineLocation.AT_BASE);}
  }
  var changes=new ArrayList<>(resolution.evaluations());
  changes.add("outcomeFamily="+e.outcomeFamily);
  changes.add("KROT.location="+e.krot.location());
  changes.add("STRIZH.location="+e.strizh.location());
  changes.add("IGLA.location="+e.igla.location());
  changes.add("reactorCondition="+e.reactorCondition);
  changes.add("reactorLocation="+e.reactorLocation);
  changes.add("reactorOutput="+e.reactorOutput);
  var ev=event("DOCTRINE_"+doctrine.replace('>','_'),EpisodeStage.DOCTRINE_CRISIS,List.of("Крепления разрушаются","KROT обездвижен","Заряд критический"),changes,"Порядок "+doctrine+" разрешён: KROT — "+e.krot.location()+", STRIZH — "+e.strizh.location()+", IGLA — "+e.igla.location()+", модуль — "+e.reactorCondition+" / "+e.reactorLocation);
  return next(s,EpisodeStage.CONSEQUENCE,e.build(),d,List.of(ev),0,s.riskCheck());
 }
 private void atBase(WorldState.Editor e){e.krot=e.krot.withLocation(MachineLocation.AT_BASE);e.strizh=e.strizh.withLocation(MachineLocation.AT_BASE);e.igla=e.igla.withLocation(MachineLocation.AT_BASE);}private void lostReactor(WorldState.Editor e){e.reactorCondition=ReactorCondition.LOST;e.reactorLocation=ReactorLocation.LOST;e.reactorOutput=ReactorOutput.NONE;}
 private EpisodeSessionState consequence(EpisodeSessionState s,ChoiceDecision d){var e=s.world().edit();switch(d.choiceId()){
  case INSTALL_FULL_POWER->{install(e,ReactorOutput.FULL);e.igla=e.igla.withLifeAndLocation(MachineLife.LOST,MachineLocation.LOST);}
  case POWER_RESCUE_BEACON->{install(e,ReactorOutput.LIMITED);e.igla=e.igla.withLocation(MachineLocation.AT_BASE);e.flags.add(WorldFlag.RESCUE_BEACON_ACTIVE);}
  case SEND_KROT_FOR_IGLA->{install(e,ReactorOutput.FULL);e.igla=e.igla.withLocation(MachineLocation.AT_BASE);e.krot=e.krot.withActuator(e.returnWindow==ReturnWindow.LONG?KrotActuator.DAMAGED:KrotActuator.CRIPPLED);}
  case RECOVER_KROT_AND_MODULE->{e.krot=e.krot.withLocation(MachineLocation.AT_BASE);e.reactorCondition=ReactorCondition.DEGRADED;install(e,ReactorOutput.LIMITED);if(e.returnWindow!=ReturnWindow.LONG)e.igla=e.igla.withManipulator(IglaManipulator.DAMAGED);}
  case RECOVER_MODULE_ONLY->{e.krot=e.krot.withLifeAndLocation(MachineLife.LOST,MachineLocation.LOST);install(e,ReactorOutput.FULL);}
  case ABANDON_REACTOR_SITE->{e.krot=e.krot.withLifeAndLocation(MachineLife.LOST,MachineLocation.LOST);lostReactor(e);}
  case INSTALL_LIMITED_MODULE->install(e,ReactorOutput.LIMITED);
  case DISASSEMBLE_MODULE->{lostReactor(e);e.generatorHours+=168;e.spareParts+=2;}
  case OFFER_MODULE_FOR_TRADE->{e.node12Relation=Node12Relation.CONTACTED;e.flags.add(WorldFlag.TRADE_OFFER_SENT);}
  case ACCEPT_AUSTERITY->{e.powerMode=PowerMode.EMERGENCY;e.workshopStatus=WorkshopStatus.OFFLINE;}
  case CANNIBALIZE_KROT->{e.krot=e.krot.withLifeAndLocation(MachineLife.LOST,MachineLocation.LOST);e.generatorHours+=168;e.spareParts+=2;}
  case BROADCAST_FOR_HELP->{e.node12Relation=Node12Relation.CONTACTED;e.flags.add(WorldFlag.HELP_REQUEST_SENT);}
  case RESCUE_KROT_WITH_IGLA->{e.krot=e.krot.withLocation(MachineLocation.AT_BASE);if(e.returnWindow!=ReturnWindow.LONG)e.igla=e.igla.withManipulator(IglaManipulator.DAMAGED);}
  case ABANDON_KROT->e.krot=e.krot.withLifeAndLocation(MachineLife.LOST,MachineLocation.LOST);
  case REQUEST_EXTERNAL_RESCUE->{e.node12Relation=Node12Relation.CONTACTED;e.krot=e.krot.withLocation(MachineLocation.AT_BASE).withActuator(KrotActuator.CRIPPLED);e.flags.add(WorldFlag.OWES_NODE12);}
  default->throw new AssertionError();}
  boolean early=e.flags.contains(WorldFlag.RESCUE_BEACON_ACTIVE)||(e.strizh.sensor()==StrizhSensor.OPERATIONAL&&e.strizh.life()!=MachineLife.LOST&&e.strizh.location()==MachineLocation.AT_BASE)||e.node12Relation==Node12Relation.CONTACTED;e.contactTiming=early?ContactTiming.EARLY:ContactTiming.LATE;
  var ev=event("S4_"+d.choiceId(),EpisodeStage.CONSEQUENCE,List.of("outcomeFamily="+e.outcomeFamily,"returnWindow="+e.returnWindow),List.of("contactTiming="+e.contactTiming),"Выбрано "+d.choiceId()+"; контакт "+e.contactTiming);return next(s,EpisodeStage.NODE12_CONTACT,e.build(),d,List.of(ev),0,s.riskCheck());}
 private void install(WorldState.Editor e,ReactorOutput output){e.reactorLocation=ReactorLocation.INSTALLED;e.reactorOutput=output;e.powerMode=output==ReactorOutput.FULL?PowerMode.FULL:PowerMode.LIMITED;e.workshopStatus=output==ReactorOutput.FULL?WorkshopStatus.ONLINE:WorkshopStatus.OFFLINE;}
 private EpisodeSessionState contact(EpisodeSessionState s,ChoiceDecision d){var e=s.world().edit();switch(d.choiceId()){
  case SEND_GREENHOUSE_CULTURES->{e.foodStatus=FoodStatus.RATIONED_TWO_DAYS;e.node12Relation=Node12Relation.ALLY;repairAtBase(e);}
  case SHARE_REACTOR_POWER->{e.reactorOutput=ReactorOutput.LIMITED;e.powerMode=PowerMode.LIMITED;e.node12Relation=Node12Relation.ALLY;e.workshopStatus=WorkshopStatus.OFFLINE;}
  case TRADE_DEGRADED_MODULE->{e.reactorLocation=ReactorLocation.NODE12;e.generatorHours+=120;e.node12Relation=Node12Relation.COOPERATIVE;repairAtBase(e);}
  case SEND_IGLA_TO_NODE12->{e.igla=e.igla.withLocation(MachineLocation.AWAY);e.node12Relation=Node12Relation.COOPERATIVE;if(e.strizh.location()==MachineLocation.AT_BASE)e.strizh=e.strizh.withSensor(StrizhSensor.OPERATIONAL);if(e.contactTiming==ContactTiming.LATE)e.igla=e.igla.withManipulator(IglaManipulator.DAMAGED);}
  case IGNORE_NODE12->{e.node12Relation=Node12Relation.SILENT;e.flags.add(WorldFlag.NODE12_IGNORED);}default->throw new AssertionError();}
  e.shelterProfile=profile(e.build());var ev=event("S5_"+d.choiceId(),EpisodeStage.NODE12_CONTACT,List.of("NODE12 population=18","waterEmergencyAuthentic=true","contactTiming="+e.contactTiming),List.of("node12Relation="+e.node12Relation,"shelterProfile="+e.shelterProfile),"Получен сигнал NODE12; выполнено "+d.choiceId()+"; профиль "+e.shelterProfile);return next(s,EpisodeStage.EPILOGUE,e.build(),d,List.of(ev),0,s.riskCheck());}
 private void repairAtBase(WorldState.Editor e){if(e.strizh.location()==MachineLocation.AT_BASE)e.strizh=e.strizh.withSensor(StrizhSensor.OPERATIONAL);if(e.krot.location()==MachineLocation.AT_BASE)e.krot=e.krot.withActuator(switch(e.krot.actuator()){case CRIPPLED->KrotActuator.DAMAGED;case DAMAGED,WORN->KrotActuator.WORN;});}
 public ShelterProfile profile(WorldState w){if(w.flags().contains(WorldFlag.GREENHOUSE_ACTIVE)&&w.node12Relation()==Node12Relation.ALLY)return ShelterProfile.AGRARIAN_ALLIANCE;if(w.durablePower()&&w.reactorOutput()==ReactorOutput.FULL&&w.workshopStatus()==WorkshopStatus.ONLINE&&w.allMachinesSaved())return ShelterProfile.INDUSTRIAL_HUB;if(w.durablePower()&&w.reactorOutput()==ReactorOutput.FULL&&!w.allMachinesSaved())return ShelterProfile.POWERED_STRONGHOLD;if(w.powerMode()==PowerMode.LIMITED&&w.allMachinesSaved())return ShelterProfile.MOBILE_COMMUNE;if(w.node12Relation()==Node12Relation.ALLY||w.node12Relation()==Node12Relation.COOPERATIVE)return ShelterProfile.DEPENDENT_NETWORK;if(w.powerMode()==PowerMode.EMERGENCY||!w.durablePower())return ShelterProfile.AUSTERITY_ENCLAVE;return ShelterProfile.SURVIVAL_OUTPOST;}
 private EpisodeStep terminal(EpisodeSessionState s){var w=s.world();String atmosphere=s.events().stream().map(GameEvent::atmosphericText).collect(java.util.stream.Collectors.joining("\n"));String causal=s.events().stream().map(GameEvent::causalText).collect(java.util.stream.Collectors.joining("\n"));var result=new EpisodeResult(w,w.shelterProfile(),s.events(),s.decisions(),s.seed(),atmosphere,causal);return new EpisodeStep(EpisodeStage.EPILOGUE,"Эпилог","Эпизод завершён",List.of(),false,true,result);}
}
