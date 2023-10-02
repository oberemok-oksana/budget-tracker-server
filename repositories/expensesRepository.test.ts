import { describe, it, expect, beforeEach } from "vitest";
import expensesRepository from "./expensesRepository.js";
import db, { setupDB } from "../lib/db.js";
import { auth } from "../lucia.js";
import { createNewUser } from "../lib/lib.js";

describe("ExpensesRepository", () => {
  beforeEach(() => {
    setupDB();
  });

  describe("getAllExpenses", () => {
    it("shows all expenses for a particular user", async () => {
      const user = await createNewUser();
      const user2 = await createNewUser();

      const userExpenses = [
        {
          id: 1,
          user_id: user.userId,
          category: "Food",
          sub_category: "Dining out",
          date: "15/09/2023",
          payment: "Card",
          currency: "TBH",
          amount: 1320,
          comment: "",
        },
        {
          id: 2,
          user_id: user.userId,
          category: "Rent",
          sub_category: "-",
          date: "01/10/2023",
          payment: "Card",
          currency: "USD",
          amount: 780,
          comment: "airbnb",
        },
      ];

      const user2Expense = [
        {
          id: 3,
          user_id: user2.userId,
          category: "Transportation",
          sub_category: "-",
          date: "11/10/2023",
          payment: "Cash",
          currency: "USD",
          amount: 200,
          comment: "airbnb",
        },
      ];

      const data = db.prepare(
        "INSERT INTO expenses (user_id,category,sub_category,date,payment,currency,amount,comment) VALUES (@user_id,@category,@sub_category,@date,@payment,@currency,@amount,@comment)"
      );
      data.run(userExpenses[0]);
      data.run(userExpenses[1]);
      data.run(user2Expense[0]);

      const actual = expensesRepository.getAllExpenses(user.userId);

      expect(actual).toStrictEqual(userExpenses);
    });
  });
});
