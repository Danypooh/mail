document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

  document
    .querySelector("#compose-form")
    .removeEventListener("submit", send_email);
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);
}

function send_email(event) {
  event.preventDefault();

  // Create a special FormData object from the form
  const formData = new FormData(event.target);

  // Convert FormData to a regular object
  const formObject = {};
  formData.forEach((value, key) => {
    formObject[key] = value;
  });

  const url = "/emails";
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formObject),
  })
    .then((response) => {
      response.json();
    })
    .then((result) => {
      load_mailbox("sent");
    })
    .catch((error) => console.error("Error:", error));
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  const emailsView = document.querySelector("#emails-view");
  emailsView.innerHTML = `<h3 class="my-4">${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Create HTML mails containers
  const mails = document.createElement("div");
  mails.className = "container";
  emailsView.appendChild(mails);

  const mailsList = document.createElement("div");
  mailsList.className = "list-group";
  mails.appendChild(mailsList);

  const url = `/emails/${mailbox}`;

  // Show the mailbox mails
  fetch(url)
    .then((response) => response.json())
    .then((emails) => {
      // Iterate over each email in the array
      emails.forEach((email) => {
        const mail = document.createElement("a");
        mail.className = "list-group-item list-group-item-action mb-2 mail";
        mail.href = "#";
        mail.style.cursor = "pointer";

        mail.read === true
          ? mail.classList.add("readed")
          : mail.classList.add("unreaded");

        mail.innerHTML = `
        <h5 class="mb-1"> Subject: ${email.subject}</h5>
        <p class="mb-1"><strong> From: </strong> ${email.sender}</p>
        <p class="mb-1"><strong> Time: </strong> ${email.timestamp}</p>
        `;

        mailsList.appendChild(mail);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
