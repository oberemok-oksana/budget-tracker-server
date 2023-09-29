import expensesRepository from "../repositories/expensesRepository.js";
import { ExpenseType } from "../types/types.js";

class ExpensesService {
  getAllExpenses(userId: string) {
    return expensesRepository.getAllExpenses(userId);
  }

  getMonthExpenses(userId: string, date: string) {
    return expensesRepository.getMonthExpenses(userId, date);
  }

  getFilteredExpenses(userId: string, date?: string, filter?: string) {
    return expensesRepository.getFilteredExpenses(userId, date, filter);
  }

  deleteExpense(id: number) {
    return expensesRepository.deleteExpense(id);
  }

  addExpense(expense: ExpenseType, userId: string) {
    return expensesRepository.addExpense(expense, userId);
  }

  editExpense(id: number, partialExpense: Partial<ExpenseType>) {
    const expense = expensesRepository.getExpenseById(id);
    const updatedExpense = { ...expense, ...partialExpense };
    return expensesRepository.editExpense(updatedExpense);
  }
}

const expensesService = new ExpensesService();

export default expensesService;
