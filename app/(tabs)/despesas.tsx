import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: number;
  title: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

interface Category {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export default function DespesasScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      title: 'Salário',
      category: 'Receita',
      amount: 5000.00,
      type: 'income',
      date: '30/04/2025',
    },
    {
      id: 2,
      title: 'Saúde',
      category: 'Despesa',
      amount: -300.00,
      type: 'expense',
      date: '17/05/2025',
    },
    {
      id: 3,
      title: 'Educação',
      category: 'Despesa',
      amount: -850.00,
      type: 'expense',
      date: '14/05/2025',
    },
    {
      id: 4,
      title: 'Alimentação',
      category: 'Despesa',
      amount: -1250.50,
      type: 'expense',
      date: '19/05/2025',
    },
  ]);

  const categories: Category[] = [
    {
      name: 'Alimentação',
      amount: 1250.50,
      percentage: 52.1,
      color: '#E74C3C',
    },
    {
      name: 'Educação',
      amount: 850.00,
      percentage: 35.4,
      color: '#E74C3C',
    },
    {
      name: 'Saúde',
      amount: 300.00,
      percentage: 12.5,
      color: '#E74C3C',
    },
  ];

  const totalIncome = 5000.00;
  const totalExpenses = 2400.50;
  const balance = totalIncome - totalExpenses;

  const handleAddTransaction = () => {
    Alert.alert('Adicionar Transação', 'Funcionalidade será implementada');
  };

  const handleExportData = () => {
    Alert.alert('Exportar Dados', 'Os dados serão exportados em formato de planilha');
  };

  const handleDeleteTransaction = (transactionId: number) => {
    Alert.alert(
      'Remover Transação',
      'Tem certeza que deseja remover esta transação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
          },
        },
      ]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Math.abs(value));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Controle Financeiro</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={handleExportData}
          >
            <Ionicons name="download" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddTransaction}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalIncome)}</Text>
            </View>
            <Ionicons name="trending-up" size={24} color="#2ECC71" />
          </View>

          <View style={[styles.summaryCard, styles.expenseCard]}>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalExpenses)}</Text>
            </View>
            <Ionicons name="trending-down" size={24} color="#E74C3C" />
          </View>

          <View style={[styles.summaryCard, styles.balanceCard]}>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Saldo do Mês</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(balance)}</Text>
            </View>
          </View>
        </View>

        {/* Despesas por Categoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
          
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryPercentage}>{category.percentage.toFixed(1)}% do total</Text>
              </View>
              <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${category.percentage}%`,
                      backgroundColor: category.color,
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Transações Recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transações Recentes</Text>
          
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionContent}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <View style={styles.transactionMeta}>
                    <Text style={[
                      styles.transactionTag,
                      transaction.type === 'income' ? styles.incomeTag : styles.expenseTag
                    ]}>
                      {transaction.category}
                    </Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                </View>
                <View style={styles.transactionAmountContainer}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTransaction(transaction.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    backgroundColor: '#2ECC71',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryContainer: {
    marginTop: 20,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2ECC71',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  balanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  section: {
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6C757D',
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionTag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  incomeTag: {
    backgroundColor: '#D4EDDA',
    color: '#2ECC71',
  },
  expenseTag: {
    backgroundColor: '#F8D7DA',
    color: '#E74C3C',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6C757D',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#2ECC71',
  },
  expenseAmount: {
    color: '#E74C3C',
  },
  deleteButton: {
    padding: 4,
  },
});