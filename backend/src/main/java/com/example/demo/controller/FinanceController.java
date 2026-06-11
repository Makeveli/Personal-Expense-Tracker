package com.example.demo.controller;

import com.example.demo.dto.DashboardSummary;
import com.example.demo.model.Budget;
import com.example.demo.model.Transaction;
import com.example.demo.repository.BudgetRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FinanceController {
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final FinanceService financeService;

    @GetMapping("/transactions")
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @PostMapping("/transactions")
    public Transaction addTransaction(@RequestBody Transaction transaction) {
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDate.now());
        }
        return transactionRepository.save(transaction);
    }

    @DeleteMapping("/transactions/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionRepository.deleteById(id);
    }

    @GetMapping("/budgets")
    public List<Budget> getBudgets(@RequestParam String monthYear) {
        return budgetRepository.findByMonthYear(monthYear);
    }

    @PostMapping("/budgets")
    public Budget setBudget(@RequestBody Budget budget) {
        return budgetRepository.findByCategoryAndMonthYear(budget.getCategory(), budget.getMonthYear())
                .map(existing -> {
                    existing.setLimitAmount(budget.getLimitAmount());
                    return budgetRepository.save(existing);
                })
                .orElseGet(() -> budgetRepository.save(budget));
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummary getSummary(@RequestParam String monthYear) {
        return financeService.getDashboardSummary(monthYear);
    }
}
