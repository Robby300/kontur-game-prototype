package game.kontur.prototype.domain;

import static game.kontur.prototype.domain.GameTypes.*;

public final class MachineStates {
    private MachineStates() {}
    public record KrotState(MachineLife life, MachineLocation location, KrotActuator actuator) {
        public KrotState { validate(life, location); }
        public KrotState withLifeAndLocation(MachineLife l, MachineLocation p) { return new KrotState(l,p,actuator); }
        public KrotState withLocation(MachineLocation p) { return new KrotState(life,p,actuator); }
        public KrotState withActuator(KrotActuator a) { return new KrotState(life,location,a); }
    }
    public record StrizhState(MachineLife life, MachineLocation location, StrizhSensor sensor) {
        public StrizhState { validate(life, location); }
        public StrizhState withLife(MachineLife l) { return new StrizhState(l,l==MachineLife.LOST?MachineLocation.LOST:location,sensor); }
        public StrizhState withLocation(MachineLocation p) { return new StrizhState(life,p,sensor); }
        public StrizhState withSensor(StrizhSensor s) { return new StrizhState(life,location,s); }
    }
    public record IglaState(MachineLife life, MachineLocation location, IglaManipulator manipulator) {
        public IglaState { validate(life, location); }
        public IglaState withLifeAndLocation(MachineLife l, MachineLocation p) { return new IglaState(l,p,manipulator); }
        public IglaState withLocation(MachineLocation p) { return new IglaState(life,p,manipulator); }
        public IglaState withManipulator(IglaManipulator m) { return new IglaState(life,location,m); }
    }
    private static void validate(MachineLife life, MachineLocation location) {
        if ((life==MachineLife.LOST)!=(location==MachineLocation.LOST)) throw new IllegalArgumentException("LOST life and location must coincide");
    }
}
