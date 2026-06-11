package com.example.demo.service;

import com.example.demo.dto.DashboardSummary;
import com.example.demo.model.Budget;
import com.example.demo.model.Transaction;
import com.example.demo.repository.BudgetRepository;
import com.example.demo.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
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
public class FinanceService {
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public DashboardSummary getDashboardSummary(String monthYear) {
        LocalDate start = LocalDate.parse(monthYear + "-01");
        LocalDate end = start.plusMonths(1).minusDays(1);

        List<Transaction> transactions = transactionRepository.findByDateBetween(start, end);
        List<Budget> budgets = budgetRepository.findByMonthYear(monthYear);

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, DashboardSummary.CategorySummary> categorySummaries = new HashMap<>();

        // Group expenses by category
        transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .forEach(t -> {
                    DashboardSummary.CategorySummary summary = categorySummaries.computeIfAbsent(t.getCategory(), 
                        k -> new DashboardSummary.CategorySummary(BigDecimal.ZERO, BigDecimal.ZERO, 0.0));
                    summary.setSpent(summary.getSpent().add(t.getAmount()));
                });

        // Add budget info
        budgets.forEach(b -> {
            DashboardSummary.CategorySummary summary = categorySummaries.computeIfAbsent(b.getCategory(), 
                k -> new DashboardSummary.CategorySummary(BigDecimal.ZERO, BigDecimal.ZERO, 0.0));
            summary.setBudget(b.getLimitAmount());
            if (b.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
                summary.setPercentage(summary.getSpent().divide(b.getLimitAmount(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue());
            }
        });

        return new DashboardSummary(totalIncome, totalExpenses, totalIncome.subtract(totalExpenses), categorySummaries);
    }
}
