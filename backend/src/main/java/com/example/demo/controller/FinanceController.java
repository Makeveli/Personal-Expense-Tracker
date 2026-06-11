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
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FinanceController {
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final FinanceService financeService;
    private final com.example.demo.repository.TransactionTypeRepository transactionTypeRepository;
    private final com.example.demo.repository.CategoryRepository categoryRepository;

    @GetMapping("/transactions")
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @PostMapping("/transactions")
    public Transaction addTransaction(@RequestBody Map<String, Object> payload) {
        Transaction transaction = new Transaction();
        transaction.setDescription((String) payload.get("description"));
        transaction.setAmount(new java.math.BigDecimal(payload.get("amount").toString()));
        
        String catName = (String) payload.get("category");
        com.example.demo.model.Category category = categoryRepository.findByName(catName)
            .orElseGet(() -> {
                com.example.demo.model.Category newCat = new com.example.demo.model.Category();
                newCat.setName(catName);
                return categoryRepository.save(newCat);
            });
        transaction.setCategory(category);
        
        if (payload.containsKey("date") && payload.get("date") != null) {
            transaction.setDate(LocalDate.parse((String) payload.get("date")));
        } else {
            transaction.setDate(LocalDate.now());
        }

        String typeName = (String) payload.get("type");
        com.example.demo.model.TransactionType type = transactionTypeRepository.findByName(typeName)
            .orElseGet(() -> transactionTypeRepository.save(new com.example.demo.model.TransactionType(null, typeName)));
        
        transaction.setType(type);
        
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
    public Budget setBudget(@RequestBody Map<String, Object> payload) {
        String monthYear = (String) payload.get("monthYear");
        String catName = (String) payload.get("category");
        java.math.BigDecimal limitAmount = new java.math.BigDecimal(payload.get("limitAmount").toString());

        com.example.demo.model.Category category = categoryRepository.findByName(catName)
            .orElseGet(() -> categoryRepository.save(new com.example.demo.model.Category(null, catName)));

        // We can't rely on the old findByCategoryAndMonthYear signature easily since category is now an object in the DB.
        // It's cleaner to fetch all for the month and filter, or we just rely on standard JPA.
        // For simplicity, let's fetch all budgets for the month and update if category matches.
        List<Budget> existingBudgets = budgetRepository.findByMonthYear(monthYear);
        for (Budget b : existingBudgets) {
            if (b.getCategory().getId().equals(category.getId())) {
                b.setLimitAmount(limitAmount);
                return budgetRepository.save(b);
            }
        }

        Budget newBudget = new Budget(null, category, limitAmount, monthYear);
        return budgetRepository.save(newBudget);
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummary getSummary(@RequestParam String monthYear) {
        return financeService.getDashboardSummary(monthYear);
    }
}
