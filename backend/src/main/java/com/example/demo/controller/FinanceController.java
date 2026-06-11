package com.example.demo.controller;

import com.example.demo.dto.DashboardSummary;
import com.example.demo.model.Budget;
import com.example.demo.model.Transaction;
import com.example.demo.repository.BudgetRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.service.FinanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class FinanceController {
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final FinanceService financeService;
    private final com.example.demo.repository.TransactionTypeRepository transactionTypeRepository;
    private final com.example.demo.repository.CategoryRepository categoryRepository;

    @GetMapping("/transactions")
    public List<Transaction> getAllTransactions() {
        log.info("Fetching all transactions");
        return transactionRepository.findAll();
    }

    @PostMapping("/transactions")
    public Transaction addTransaction(@RequestBody Map<String, Object> payload) {
        log.info("Adding new transaction: {}", payload);
        Transaction transaction = new Transaction();
        transaction.setDescription((String) payload.get("description"));
        transaction.setAmount(new java.math.BigDecimal(payload.get("amount").toString()));
        
        String catName = (String) payload.get("category");
        com.example.demo.model.Category category = categoryRepository.findByName(catName)
            .orElseGet(() -> {
                log.info("Creating new category: {}", catName);
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
            .orElseGet(() -> {
                log.info("Creating new transaction type: {}", typeName);
                return transactionTypeRepository.save(new com.example.demo.model.TransactionType(null, typeName));
            });
        
        transaction.setType(type);
        
        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction saved with id: {}", saved.getId());
        return saved;
    }

    @DeleteMapping("/transactions/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        log.info("Deleting transaction with id: {}", id);
        transactionRepository.deleteById(id);
    }

    @GetMapping("/budgets")
    public List<Budget> getBudgets(@RequestParam String monthYear) {
        log.info("Fetching budgets for month: {}", monthYear);
        return budgetRepository.findByMonthYear(monthYear);
    }

    @PostMapping("/budgets")
    public Budget setBudget(@RequestBody Map<String, Object> payload) {
        String monthYear = (String) payload.get("monthYear");
        String catName = (String) payload.get("category");
        java.math.BigDecimal limitAmount = new java.math.BigDecimal(payload.get("limitAmount").toString());

        log.info("Setting budget for category {} in month {} to {}", catName, monthYear, limitAmount);

        com.example.demo.model.Category category = categoryRepository.findByName(catName)
            .orElseGet(() -> {
                log.info("Creating new category during budget setup: {}", catName);
                return categoryRepository.save(new com.example.demo.model.Category(null, catName));
            });

        List<Budget> existingBudgets = budgetRepository.findByMonthYear(monthYear);
        for (Budget b : existingBudgets) {
            if (b.getCategory().getId().equals(category.getId())) {
                log.info("Updating existing budget id: {}", b.getId());
                b.setLimitAmount(limitAmount);
                return budgetRepository.save(b);
            }
        }

        log.info("Creating new budget entry");
        Budget newBudget = new Budget(null, category, limitAmount, monthYear);
        return budgetRepository.save(newBudget);
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummary getSummary(@RequestParam String monthYear) {
        log.info("Generating dashboard summary for month: {}", monthYear);
        return financeService.getDashboardSummary(monthYear);
    }
}
