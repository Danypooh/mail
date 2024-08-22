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
  document.querySelector("#read-view").style.display = "none";

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

function update_read_status(email_id) {
  const url = `/emails/${email_id}`;

  fetch(url, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

function create_read_email_layout(email) {
  const emailDetail = document.createElement("div");
  emailDetail.className = "card";

  emailDetail.innerHTML = `
   <div class="card-header bg-light d-flex justify-content-between">
   <div>
    <h5 class="mb-1"><strong>Subject:</strong> ${email.subject}</h5>
    <p class="mb-1"><strong>From:</strong> ${email.sender}</p>
    <p class="mb-1"><strong>To:</strong> ${email.recipients.join(", ")}</p>
   </div>
   <p class="text-muted mb-0"><strong>${email.timestamp}</strong></p>
  </div>
  <div class="card-body">
    <p>${email.body.replace(/\n/g, "<br>")}</p>
  </div>
`;

  return emailDetail;
}

function load_email(email_id) {
  update_read_status(email_id);

  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#read-view").style.display = "block";

  const readView = document.querySelector("#read-view");
  readView.innerHTML = "";

  const url = `/emails/${email_id}`;

  fetch(url)
    .then((response) => response.json())
    .then((email) => {
      console.log(email);
      const mail = create_read_email_layout(email);
      readView.appendChild(mail);
      console.log(readView);
    })
    .catch((error) => console.error("Error:", error));
}

function create_email_layout(email) {
  const mail = document.createElement("a");
  mail.addEventListener("click", () => load_email(email.id));
  mail.className = "list-group-item list-group-item-action mb-2 mail";
  mail.style.cursor = "pointer";

  if (email.read) {
    mail.classList.remove("unreaded");
    mail.classList.add("readed");
  } else {
    mail.classList.remove("readed");
    mail.classList.add("unreaded");
  }

  mail.innerHTML = `
  <h5 class="mb-1"> Subject: ${email.subject}</h5>
  <p class="mb-1"><strong> From: </strong> ${email.sender}</p>
  <p class="mb-1"><strong> Time: </strong> ${email.timestamp}</p>
  `;

  return mail;
}

function get_mailbox(mailbox) {
  const mailsList = document.querySelector("#mails-list");
  const url = `/emails/${mailbox}`;

  // Show the mailbox mails
  fetch(url)
    .then((response) => response.json())
    .then((emails) => {
      // Iterate over each email in the array
      emails.forEach((email) => {
        const mail = create_email_layout(email);
        mailsList.appendChild(mail);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#read-view").style.display = "none";

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
  mailsList.id = "mails-list";
  mails.appendChild(mailsList);

  get_mailbox(mailbox);
}
