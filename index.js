import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "permalist",
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
db.connect();

let items = [];

async function fetchItems() {
  const results = await db.query("SELECT * from items ORDER BY id ASC");
  items = results.rows;
}

app.get("/", async (req, res) => {
  await fetchItems();
  res.render("index.ejs", {
    listTitle: new Date().toDateString(),
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const today = new Date().toISOString();
  console.log("Date: ", today);
  const result = await db.query(
    "INSERT INTO items (title,created_at) VALUES ($1,$2) RETURNING *",
    [item, today]
  );
  console.log(result.rows);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const newItemTitle = req.body.updatedItemTitle;
  const itemId = req.body.updatedItemId;
  const today = new Date().toISOString();
  const result = await db.query(
    "UPDATE items SET title = $1, updated_at = $2 WHERE id = $3 RETURNING *",
    [newItemTitle, today, itemId]
  );
  console.log(result.rows);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const itemId = req.body.deleteItemId;
  const result = await db.query("DELETE FROM items WHERE id = $1 RETURNING *", [
    itemId,
  ]);

  console.log(result.rows);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
