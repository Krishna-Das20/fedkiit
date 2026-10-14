"use client";

import { useState, useEffect } from "react";
import styles from "./styles/LiveEventPopup.module.scss";
import { api } from "../../../../services";
import { cdn } from "../../../../utils/cloudinary";
import type { FormRecord } from "../../../../types/form";

const LiveEventPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEventOngoing, setIsEventOngoing] = useState(false);
  const [eventImage, setEventImage] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const fetchEventData = async () => {
      try {
        const response = await api.get("/api/form/getAllForms");
        const events: FormRecord[] = response.data.events ?? [];

        // The first public, upcoming main event (not a sub-event of another).
        const liveEvent = events.find(
          (event) =>
            event.info.isEventPast === false &&
            event.info.isPublic === true &&
            event.info.relatedEvent === "null"
        );

        // Nothing is live (the usual case between events), it has no poster
        // to show, or the popup already appeared this session.
        const poster = liveEvent?.info.eventImg;
        if (!poster || sessionStorage.getItem("popupDisplayed")) return;

        setIsEventOngoing(true);
        setEventImage(poster);

        timer = setTimeout(() => {
          setIsVisible(true);
          sessionStorage.setItem("popupDisplayed", "true");
        }, 2500);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchEventData();

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isEventOngoing) {
      if (isVisible) {
        document.body.classList.add(styles.lockScroll);
      } else {
        document.body.classList.remove(styles.lockScroll);
      }
    }

    return () => {
      document.body.classList.remove(styles.lockScroll);
    };
  }, [isVisible, isEventOngoing]);

  const closePopup = () => {
    setIsVisible(false);
  };

  return (
    <>
      {isEventOngoing && (
        <div className={`${styles.popup} ${isVisible ? styles.fadeIn : ""}`}>
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={closePopup}>
              ×
            </button>
            <a href="/Events">
              <img src={cdn(eventImage, 600)} alt="Event" className={styles.popupContent} loading="lazy" decoding="async" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveEventPopup;
