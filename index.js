let state = {
    activity: "cycling",
    distance: 0,
};
let data = [];

const btns = document.querySelectorAll("button");
const form = document.querySelector("form");
const activityName = document.getElementById("activityName");
const error = document.getElementById("error");


form.addEventListener("submit", handelSubmit);

btns.forEach((btn) => {
    btn.addEventListener("click", handelClick);
});

function handelSubmit(e) {
    e.preventDefault();
    let distance = parseInt(form.activity.value);
    if (!distance) {
        error.textContent = "enter a valid distance please";
        return;
    }
    state.distance = distance;
    let record = { ...state, date: new Date().toString() };

    error.textContent = "";
    state.distance = 0;
    form.reset();

    db.collection("fitness")
        .add(record)
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            error.textContent = "";
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
            error.textContent = "something went wrong";
        });
}

function handelClick(e) {
    btns.forEach((btn) => btn.classList.remove("active"));
    state.activity = e.target.dataset.activity;
    activityName.innerText = state.activity;
    e.target.classList.add("active");

    updateChart(data);
}
