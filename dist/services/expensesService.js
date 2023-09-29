import expensesRepository from "../repositories/expensesRepository.js";
class ExpensesService {
    getAllExpenses(userId) {
        return expensesRepository.getAllExpenses(userId);
    }
    getMonthExpenses(userId, date) {
        return expensesRepository.getMonthExpenses(userId, date);
    }
    getFilteredExpenses(userId, date, filter) {
        return expensesRepository.getFilteredExpenses(userId, date, filter);
    }
    deleteExpense(id) {
        return expensesRepository.deleteExpense(id);
    }
    addExpense(expense, userId) {
        return expensesRepository.addExpense(expense, userId);
    }
    editExpense(id, partialExpense) {
        const expense = expensesRepository.getExpenseById(id);
        const updatedExpense = Object.assign(Object.assign({}, expense), partialExpense);
        return expensesRepository.editExpense(updatedExpense);
    }
}
const expensesService = new ExpensesService();
export default expensesService;
