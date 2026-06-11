import com.example.demo.model.Budget;
import com.example.demo.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByMonthYear(String monthYear);
    Optional<Budget> findByCategoryAndMonthYear(Category category, String monthYear);
}
