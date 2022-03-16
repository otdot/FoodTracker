import snackbar from "snackbar";
import "snackbar/dist/snackbar.min.css";
import Chart from "chart.js/auto";
import { FetchWrapper } from "./fetch-wrapper";

const form = document.querySelector("form");
const nutriChart = document.querySelector("#nutriChart");
const clearApiButton = document.querySelector("#clearApiButton");

const FoodAPI = new FetchWrapper(
  "https://firestore.googleapis.com/v1/projects/programmingjs-90a13/databases/(default)/documents/"
);

const updateDishes = () => {
  FoodAPI.get("otto").then((data) => {
    for (let i = 0; i < data.documents.length; i++) {
      const fats = data.documents[i].fields.fat.integerValue;
      const carbs = data.documents[i].fields.carbs.integerValue;
      const name = data.documents[i].fields.name.stringValue;
      const protein = data.documents[i].fields.protein.integerValue;
      addDishToList(carbs, protein, fats, name);
    }
  });
};

const postFood = (carbs, proteins, fats, selectedDish) => {
  return FoodAPI.post("otto", {
    fields: {
      fat: {
        integerValue: fats,
      },
      name: {
        stringValue: selectedDish,
      },
      protein: {
        integerValue: proteins,
      },
      carbs: {
        integerValue: carbs,
      },
    },
  });
};

const addFood = (e) => {
  e.preventDefault();
  const selectedDish = document.querySelector("#dish").value;
  const carbsValue = document.querySelector("#carbs").value;
  const proteinValue = document.querySelector("#protein").value;
  const fatValue = document.querySelector("#fats").value;
  if (
    selectedDish !== "Select Food" &&
    carbsValue &&
    proteinValue &&
    fatValue
  ) {
    snackbar.show("Dish added succesfully");
    baseChart.destroy();
    baseChart = createChart(carbsValue, proteinValue, fatValue, selectedDish);
    postFood(carbsValue, proteinValue, fatValue, selectedDish);
    addDishToList(carbsValue, proteinValue, fatValue, selectedDish);
    document.querySelector("#carbs").value = "";
    document.querySelector("#protein").value = "";
    document.querySelector("#fats").value = "";
  } else {
    alert("Please fill the form throughout (Dish, carbs, fats and protein)");
  }
};

const createChart = (carbs, proteins, fats) => {
  const data = {
    labels: ["Carbohydrates", "Proteins", "Fats"],
    datasets: [
      {
        label: "Nutrients",
        backgroundColor: ["#f6f930ff", "#d2f898ff", "#2f2f2fff"],
        borderColor: ["#f6f930ff", "#d2f898ff", "#2f2f2fff"],
        data: [carbs, proteins, fats],
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {},
  };

  const myChart = new Chart(nutriChart, config);
  return myChart;
};

const addDishToList = (carbs, protein, fats, selectedDish) => {
  const kcals = carbs * 4 + protein * 4 + fats * 9;
  const newLi = document.createElement("li");
  const p = document.createElement("p");
  const h2 = document.createElement("h2");
  const nutriDiv = document.createElement("div");
  const pContent = document.createTextNode(`${kcals}kcal`);
  const h2Content = document.createTextNode(`${selectedDish}`);
  const nutriDivCont = document.createTextNode(
    `Carbs: ${carbs}g Protein: ${protein}g Fats: ${fats}g    `
  );

  h2.appendChild(h2Content);
  p.appendChild(pContent);
  nutriDiv.appendChild(nutriDivCont);
  newLi.appendChild(h2);
  newLi.appendChild(p);
  newLi.appendChild(nutriDiv);
  const totalCalories = document.querySelector("#totalCaloriesAmount");
  totalCalories.textContent = Number(totalCalories.textContent) + kcals;
  const dishList = document.querySelector("#dishList");
  dishList.appendChild(newLi);
};

const clearAPI = () => {
  FoodAPI.get("otto").then((data) => {
    for (d in data.documents) {
      FoodAPI.delete(`otto${data.documents[d].name.slice(63)}`);
    }
  });
  dishList.innerHTML = "";
  document.querySelector("#totalCaloriesAmount").textContent = 0;
};

updateDishes();
let baseChart = createChart(0, 0, 0);
form.addEventListener("submit", addFood);
clearApiButton.addEventListener("click", clearAPI);
