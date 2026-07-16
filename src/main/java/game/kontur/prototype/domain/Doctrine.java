package game.kontur.prototype.domain;
import java.util.*;
import static game.kontur.prototype.domain.GameTypes.OrderCard;
public record Doctrine(List<OrderCard> cards) {
  public Doctrine { cards=List.copyOf(Objects.requireNonNull(cards)); if(cards.size()!=3||new HashSet<>(cards).size()!=3||!new HashSet<>(cards).equals(EnumSet.allOf(OrderCard.class))) throw new IllegalArgumentException("Doctrine must contain M, A and R exactly once"); }
  public static Doctrine of(OrderCard... c){return new Doctrine(List.of(c));}
  public static List<Doctrine> all(){return List.of(of(OrderCard.M,OrderCard.A,OrderCard.R),of(OrderCard.M,OrderCard.R,OrderCard.A),of(OrderCard.A,OrderCard.M,OrderCard.R),of(OrderCard.A,OrderCard.R,OrderCard.M),of(OrderCard.R,OrderCard.M,OrderCard.A),of(OrderCard.R,OrderCard.A,OrderCard.M));}
  public String toString(){return String.join(">",cards.stream().map(Enum::name).toList());}
}
