
"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";

import styles from "./styles/EventsView.module.scss";
import AuthContext from "../../../../context/AuthContext";
import { api } from "../../../../services";
import {
  ComponentLoading,
  MicroLoading,
} from "../../../../microInteraction";
import { FORM_ANALYTICS_ROLES_CLIENT } from "@/lib/auth/roles";

const Events = () => {
  const authCtx = useContext(AuthContext);
  const user = authCtx?.user;

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [certMap, setCertMap] = useState({});
  const [loadingCerts, setLoadingCerts] = useState(true);

  const viewPath = "/Events";
  const analyticsPath = "/profile/events/Analytics";
  const analyticsAccessRoles = FORM_ANALYTICS_ROLES_CLIENT;

  const sortEventsByDate = (eventList) => {
    return [...eventList].sort(
      (a, b) =>
        new Date(b.info?.eventDate || 0) -
        new Date(a.info?.eventDate || 0)
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  useEffect(() => {
    let cancelled = false;

    const fetchEventsData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);

        const response = await api.get("/api/form/getAllForms");

        if (cancelled) return;

        if (response.status === 200) {
          const fetchedEvents = response.data?.events || [];

          if (user.access !== "USER") {
            setEvents(sortEventsByDate(fetchedEvents));
          } else {
            const userEvents = user.regForm || [];

            const filteredEvents = fetchedEvents.filter((event) =>
              userEvents.includes(event.id)
            );

            setEvents(sortEventsByDate(filteredEvents));
          }
        } else {
          setError({
            message:
              "Sorry for the inconvenience, we are having issues fetching your Events.",
          });
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Error fetching events:", err);

        setError({
          message:
            "Sorry for the inconvenience, we are having issues fetching your Events.",
        });
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchEventsData();

    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.access, user?.regForm]);

  useEffect(() => {
    let cancelled = false;

    const fetchCertificates = async () => {
      if (!user?.email) {
        setCertificates([]);
        setLoadingCerts(false);
        return;
      }

      setLoadingCerts(true);

      try {
        const response = await api.post(
          "/api/certificate/sendCertificatesAndEvents",
          { email: user.email },
          {
            headers: {
              Authorization: `Bearer ${authCtx.token}`,
            },
          }
        );

        if (cancelled) return;

        if (response.status === 200) {
          setCertificates(response.data?.certandevent || []);
        } else {
          setCertificates([]);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Error fetching certificates:", err);
        setCertificates([]);
      } finally {
        if (!cancelled) {
          setLoadingCerts(false);
        }
      }
    };

    fetchCertificates();

    return () => {
      cancelled = true;
    };
  }, [user?.email, authCtx.token]);

  const getCertificateForEvent = (formId) => {
    const normalizedFormId = String(formId || "").toLowerCase();

    const found = certificates.find((item) => {
      const certificateFormId = String(
        item.event?.formId || ""
      ).toLowerCase();

      const certificateEventId = String(
        item.event?.id || ""
      ).toLowerCase();

      return (
        certificateFormId === normalizedFormId ||
        certificateEventId === normalizedFormId
      );
    });

    return found?.cert || null;
  };

  useEffect(() => {
    const map = {};

    for (const event of events) {
      const cert = getCertificateForEvent(event.id);

      if (cert?.id) {
        map[event.id] = `/verify/certificate?id=${encodeURIComponent(
          cert.id
        )}`;
      }
    }

    setCertMap(map);
  }, [events, certificates]);

  if (!user) {
    return (
      <div className={styles.participatedEvents}>
        <ComponentLoading />
      </div>
    );
  }

  const canViewAnalytics =
    analyticsAccessRoles.includes(user.access) ||
    user.email === "srex@fedkiit.com";

  return (
    <div className={styles.participatedEvents}>
      <div className={styles.proHeading}>
        <h3 className={styles.headInnerText}>
          {user.access !== "USER" ? (
            <>
              <span>Events</span> Timeline
            </>
          ) : (
            <>
              <span>Participated</span> Events
            </>
          )}
        </h3>
      </div>

      {isLoading ? (
        <ComponentLoading />
      ) : (
        <>
          {error && (
            <div className={styles.error}>{error.message}</div>
          )}

          <div className={styles.tables}>
            {events.length > 0 ? (
              <table className={styles.eventsTable}>
                <thead>
                  <tr>
                    <th className={styles.mobilewidth}>Event Name</th>
                    <th className={styles.mobilewidth}>Event Date</th>
                    <th className={styles.mobilewidth}>Details</th>

                    {user.access === "USER" && (
                      <th className={styles.mobilewidth}>
                        Certificate
                      </th>
                    )}

                    {canViewAnalytics && (
                      <th
                        className={styles.mobilewidth}
                        style={{ paddingTop: "1rem" }}
                      >
                        Registrations
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event._id || event.id}>
                      <td
                        className={styles.mobilewidth}
                        style={{
                          fontWeight: "500",
                          paddingRight: "10px",
                        }}
                      >
                        {event.info?.eventTitle || "Untitled Event"}
                      </td>

                      <td style={{ fontWeight: "200" }}>
                        {formatDate(event.info?.eventDate)}
                      </td>

                      <td>
                        <Link href={`${viewPath}/${event.id}`}>
                          <button
                            style={{
                              marginLeft: "auto",
                              whiteSpace: "nowrap",
                              height: "fit-content",
                              color: "orange",
                            }}
                          >
                            View
                          </button>
                        </Link>
                      </td>

                      {user.access === "USER" && (
                        <td>
                          {loadingCerts ? (
                            <MicroLoading />
                          ) : certMap[event.id] ? (
                            <Link
                              href={certMap[event.id]}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <button>View</button>
                            </Link>
                          ) : (
                            <button
                              disabled
                              style={{ opacity: 0.5 }}
                            >
                              Not Issued
                            </button>
                          )}
                        </td>
                      )}

                      {canViewAnalytics && (
                        <td>
                          <Link
                            href={`${analyticsPath}/${event.id}`}
                          >
                            <button
                              style={{
                                marginLeft: "auto",
                                whiteSpace: "nowrap",
                                height: "fit-content",
                                color: "orange",
                              }}
                            >
                              View
                            </button>
                          </Link>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              !error && (
                <p className={styles.noEvents}>
                  Not participated in any Events
                </p>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Events;
