document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

          // Teilnehmerliste als Icon-Liste ohne Bullets
          let participantsSection = `<div class="activity-card-participants">
            <div class="activity-card-participants-title">Participants:</div>`;
          if (details.participants && details.participants.length > 0) {
            participantsSection += `<div class="activity-card-participants-list no-bullets">`;
            details.participants.forEach(email => {
              participantsSection += `
                <span class="participant-item">
                  <span class="participant-email">${email}</span>
                  <span class="delete-participant" title="Remove participant" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(email)}">🗑️</span>
                </span>`;
            });
            participantsSection += `</div>`;
          } else {
            participantsSection += `<div class="activity-card-participants-list"><em>None yet</em></div>`;
          }
          participantsSection += `</div>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsSection}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
        // Nach dem Hinzufügen: Event Listener für Delete-Icons
        setTimeout(() => {
          const deleteIcons = activityCard.querySelectorAll('.delete-participant');
          deleteIcons.forEach(icon => {
            icon.addEventListener('click', async (e) => {
              const activityName = decodeURIComponent(icon.getAttribute('data-activity'));
              const email = decodeURIComponent(icon.getAttribute('data-email'));
              if (!confirm(`Remove ${email} from ${activityName}?`)) return;
              try {
                const response = await fetch(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`, {
                  method: 'DELETE',
                });
                if (response.ok) {
                  fetchActivities();
                } else {
                  const result = await response.json();
                  alert(result.detail || 'Failed to remove participant.');
                }
              } catch (err) {
                alert('Error removing participant.');
              }
            });
          });
        }, 0);
  }

  // Function to render activities
  function renderActivities(activities) {
    const activitiesList = document.getElementById("activities-list");
    activitiesList.innerHTML = "";

    Object.entries(activities).forEach(([name, activity]) => {
      const spotsLeft = activity.max_participants - (activity.participants ? activity.participants.length : 0);
      const participants =
        activity.participants && activity.participants.length > 0
          ? "participants : " +
            activity.participants
              .map((email, idx) => `${idx + 1}- ${email}`)
              .join(" ")
          : "participants : <em>none</em>";

      const card = document.createElement("div");
      card.className = "activity-card";

      card.innerHTML = `
        <h4>${name}</h4>
        <p>${activity.description}</p>
        <p><strong>Schedule:</strong> ${activity.schedule}</p>
        <p><strong>Availability:</strong> ${spotsLeft} spots left ${participants}</p>
      `;

      activitiesList.appendChild(card);
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Aktivitätenliste sofort aktualisieren
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
