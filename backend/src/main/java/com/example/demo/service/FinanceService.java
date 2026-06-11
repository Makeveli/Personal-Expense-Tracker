package com.example.demo.service;

import com.example.demo.dto.DashboardSummary;
import com.example.demo.model.Budget;
import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.repository.BudgetRepository;
import com.example.demo.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinanceService {
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public DashboardSummary getDashboardSummary(String monthYear) {
        log.info("Calculating dashboard summary for monthYear: {}", monthYear);
        LocalDate start = LocalDate.parse(monthYear + "-01");
        LocalDate end = start.plusMonths(1).minusDays(1);

        List<Transaction> transactions = transactionRepository.findByDateBetween(start, end);
        List<Budget> budgets = budgetRepository.findByMonthYear(monthYear);
        
        log.debug("Found {} transactions and {} budgets for {}", transactions.size(), budgets.size(), monthYear);

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "INCOME".equalsIgnoreCase(t.getType().getName()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType().getName()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, DashboardSummary.CategorySummary> categorySummaries = new HashMap<>();

        // Group expenses by category
        transactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType().getName()))
                .forEach(t -> {
                    DashboardSummary.CategorySummary summary = categorySummaries.computeIfAbsent(t.getCategory().getName(), 
                        k -> new DashboardSummary.CategorySummary(BigDecimal.ZERO, BigDecimal.ZERO, 0.0));
                    summary.setSpent(summary.getSpent().add(t.getAmount()));
                });

        // Add budget info
        budgets.forEach(b -> {
            DashboardSummary.CategorySummary summary = categorySummaries.computeIfAbsent(b.getCategory().getName(), 
                k -> new DashboardSummary.CategorySummary(BigDecimal.ZERO, BigDecimal.ZERO, 0.0));
            summary.setBudget(b.getLimitAmount());
            if (b.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
                summary.setPercentage(summary.getSpent().divide(b.getLimitAmount(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue());
            }
        });
        
        log.info("Dashboard summary generated: Income={}, Expenses={}, Balance={}", totalIncome, totalExpenses, totalIncome.subtract(totalExpenses));
        return new DashboardSummary(totalIncome, totalExpenses, totalIncome.subtract(totalExpenses), categorySummaries);
    }
}
