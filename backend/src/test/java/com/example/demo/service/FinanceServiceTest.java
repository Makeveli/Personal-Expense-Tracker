package com.example.demo.service;

import com.example.demo.dto.DashboardSummary;
import com.example.demo.model.Budget;
import com.example.demo.model.Transaction;
import com.example.demo.repository.BudgetRepository;
import com.example.demo.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class FinanceServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private FinanceService financeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetDashboardSummary() {
        String monthYear = "2026-06";
        LocalDate start = LocalDate.parse("2026-06-01");
        LocalDate end = LocalDate.parse("2026-06-30");

        Transaction income = new Transaction(1L, "Salary", new BigDecimal("5000"), LocalDate.of(2026, 6, 1), "Salary", Transaction.TransactionType.INCOME);
        Transaction expense = new Transaction(2L, "Food", new BigDecimal("200"), LocalDate.of(2026, 6, 2), "Food", Transaction.TransactionType.EXPENSE);
        
        when(transactionRepository.findByDateBetween(start, end)).thenReturn(List.of(income, expense));
        
        Budget budget = new Budget(1L, "Food", new BigDecimal("500"), monthYear);
        when(budgetRepository.findByMonthYear(monthYear)).thenReturn(List.of(budget));

        DashboardSummary summary = financeService.getDashboardSummary(monthYear);

        assertEquals(new BigDecimal("5000"), summary.getTotalIncome());
        assertEquals(new BigDecimal("200"), summary.getTotalExpenses());
        assertEquals(new BigDecimal("4800"), summary.getBalance());
        
        DashboardSummary.CategorySummary foodSummary = summary.getCategorySummaries().get("Food");
        assertEquals(new BigDecimal("200"), foodSummary.getSpent());
        assertEquals(new BigDecimal("500"), foodSummary.getBudget());
        assertEquals(40.0, foodSummary.getPercentage());
    }

    @Test
    void testEmptyData() {
        String monthYear = "2026-06";
        when(transactionRepository.findByDateBetween(any(), any())).thenReturn(Collections.emptyList());
        when(budgetRepository.findByMonthYear(any())).thenReturn(Collections.emptyList());

        DashboardSummary summary = financeService.getDashboardSummary(monthYear);

        assertEquals(BigDecimal.ZERO, summary.getTotalIncome());
        assertEquals(BigDecimal.ZERO, summary.getTotalExpenses());
        assertEquals(BigDecimal.ZERO, summary.getBalance());
    }
}
