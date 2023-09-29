import db from "../lib/db.js";
class ExpensesRepository {
    getAllExpenses(userId) {
        const data = db.prepare("SELECT * FROM expenses WHERE user_id=?");
        return data.all(userId);
    }
    getMonthExpenses(userId, date) {
        const data = db.prepare("SELECT * FROM expenses WHERE user_id=? AND date > date(?,'start of month') AND date < date(?,'start of month', '+1 month')");
        return data.all(userId, date, date);
    }
    getExpenseById(userId, id) {
        const data = db.prepare("SELECT * FROM expenses WHERE user_id=? AND id=?");
        return data.get(userId, id);
    }
    getFilteredExpenses(userId, date, filter) {
        let sql = "SELECT * FROM expenses WHERE user_id=@userId ";
        const options = [];
        if (date || filter) {
            sql += "AND ";
        }
        if (date) {
            options.push("date > date(@date,'start of month') AND date < date(@date,'start of month','+1 month')");
        }
        if (filter) {
            options.push("category=@category");
        }
        sql += options.join(" AND ");
        sql += " ORDER BY date DESC ";
        const data = db.prepare(sql);
        return data.all({ userId: userId, date: date, category: filter });
    }
    deleteExpense(id) {
        const data = db.prepare("DELETE FROM expenses WHERE id=?");
        data.run(id);
    }
    addExpense(expense, userId) {
        const { category, sub_category, date, payment, currency, amount, comment } = expense;
        const data = db.prepare("INSERT INTO expenses (user_id,category,sub_category,date,payment,currency,amount,comment) VALUES (?,?,?,?,?,?,?,?)");
        data.run(userId, category, sub_category, date, payment, currency, amount, comment);
    }
    editExpense(expense) {
        const { category, sub_category, date, payment, currency, amount, comment, id, } = expense;
        console.log(expense);
        const data = db.prepare(`UPDATE expenses SET  category=?, sub_category=?, date=?,payment=?,currency=?,amount=?,comment=? WHERE id=?`);
        data.run(category, sub_category, date, payment, currency, amount, comment, id);
    }
}
const expensesRepository = new ExpensesRepository();
export default expensesRepository;
