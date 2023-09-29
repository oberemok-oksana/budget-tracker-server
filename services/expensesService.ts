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

  deleteExpense(userId: string, id: number) {
    return expensesRepository.deleteExpense(userId, id);
  }

  addExpense(expense: ExpenseType, userId: string) {
    return expensesRepository.addExpense(expense, userId);
  }

  editExpense(
    userId: string,
    id: number,
    partialExpense: Partial<ExpenseType>
  ) {
    const expense = expensesRepository.getExpenseById(userId, id);
    const updatedExpense = { ...expense, ...partialExpense };
    return expensesRepository.editExpense(userId, updatedExpense);
  }
}

const expensesService = new ExpensesService();

export default expensesService;
