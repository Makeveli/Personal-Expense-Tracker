package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummary {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal balance;
    private Map<String, CategorySummary> categorySummaries;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySummary {
        private BigDecimal spent;
        private BigDecimal budget;
        private double percentage;
    }
}
