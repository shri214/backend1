const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const PORT = 8001;
const app = express();

app.use(express.json());

const localData = [
  { id: crypto.randomUUID(), name: "Alice" },
  { id: crypto.randomUUID(), name: "Bob" },
  { id: crypto.randomUUID(), name: "Charlie" },
];

const dataPath = path.join(__dirname, "db.json");

// reading file using callback
const dataIs = (callback) => {
  fs.readFile(dataPath, "utf-8", (err, jsonData) => {
    if (err) {
      callback(err, null);
    } else {
      let data = JSON.parse(jsonData);
      callback(null, data);
    }
  });
};

// writing file
const writeData = (data, callback) => {
  const jsonData = JSON.stringify(data);
  fs.writeFile(dataPath, jsonData, "utf-8", callback);
};
//get method
app.get("/todo", (req, res) => {
  console.log("code");
  res.status(200).json(localData);
});

//post method
app.post("/post", (req, res) => {
  let newData = { id: crypto.randomUUID(), ...req.body };
  localData.push(newData);
  res.status(200).json(localData);
});

// POST method to add new data
app.post("/posts", (req, res) => {
  const newData = { ...req.body };
  console.log("newData ", newData);
  
  dataIs((err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    data.push(newData);

    writeData(data, (err) => {
      if (err) {
        console.error('Error writing data:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json(data);
    });
  });
});

// DELETE method to remove data by id
app.delete('/deletes', (req, res) => {
  const id = req.body.id;
  console.log("ID to delete: ", id);

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  dataIs((err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    const index=data.findIndex(item=>parseInt(item.id)===id);
    
    if (index===-1) {
      return res.status(404).json({ error: 'ID not found' });
    }
    data.splice(index, 1)
    writeData(data, (err) => {
      console.log(data)
      if (err) {
        console.error('Error writing data:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json(data);
    });
  });
});
app.listen(PORT, () => {
  console.log("port is running at , ", PORT);
});
