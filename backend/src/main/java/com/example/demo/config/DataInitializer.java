package com.example.demo.config;

import com.example.demo.model.Category;
import com.example.demo.model.TransactionType;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.TransactionTypeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(CategoryRepository categoryRepository, TransactionTypeRepository typeRepository) {
        return args -> {
            if (typeRepository.count() == 0) {
                typeRepository.saveAll(List.of(
                    new TransactionType(null, "INCOME"),
                    new TransactionType(null, "EXPENSE")
                ));
            }
            if (categoryRepository.count() == 0) {
                categoryRepository.saveAll(List.of(
                    new Category(null, "Food"),
                    new Category(null, "Rent"),
                    new Category(null, "Salary"),
                    new Category(null, "Travel"),
                    new Category(null, "Leisure"),
                    new Category(null, "Utilities"),
                    new Category(null, "Misc")
                ));
            }
        };
    }
}
