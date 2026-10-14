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
import type { FormRecord } from "@/src/types/form";
import type { CertificateWithEvent } from "@/src/types/certificate";

/** Older stored forms also carry a Mongo-style `_id`. */
type ListedForm = FormRecord & { _id?: string };

const Events = () => {
  const authCtx = useContext(AuthContext);
  const user = authCtx?.user;

  const [events, setEvents] = useState<ListedForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [certificates, setCertificates] = useState<CertificateWithEvent[]>([]);
  // Form id -> link to its certificate's verification page.
  const [certMap, setCertMap] = useState<Record<string, string>>({});
  const [loadingCerts, setLoadingCerts] = useState(true);

  // The public event page. There is no /profile/Events route, so the View
  // button in this table used to 404.
  const viewPath = "/Events";
  const analyticsPath = "/profile/events/Analytics";

  // Shared with the API route and the Analytics page, so the button cannot be
  // offered to someone the server will turn away — or withheld from someone it
  // would have served.
  const analyticsAccessRoles = FORM_ANALYTICS_ROLES_CLIENT;

  const sortEventsByDate = (eventList: ListedForm[]) => {
    return [...eventList].sort(
      (a, b) =>
        new Date((b.info?.eventDate as string) || 0).getTime() -
        new Date((a.info?.eventDate as string) || 0).getTime()
    );
  };

  const formatDate = (dateString: string | undefined) => {
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
          const fetchedEvents: ListedForm[] = response.data?.events || [];

          if (user.access !== "USER") {
            setEvents(sortEventsByDate(fetchedEvents));
          } else {
            const userEvents: string[] = user.regForm || [];

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
    // Not admin-gated. This is the participant's own certificate list, and the
    // endpoint authorises "your own email, or any email if you are an admin".
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

  /**
   * Certificates are issued against an `Event`, while this table lists forms,
   * so the two are matched on the `formId` the Event carries (or the Event's
   * own id). The joined event comes back with the certificate itself, so no
   * extra request is needed.
   */
  const getCertificateForEvent = (formId: string) => {
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

  // Pure lookups against data already in hand, so this is a plain synchronous
  // pass rather than one request per event.
  useEffect(() => {
    const map: Record<string, string> = {};

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
                        {formatDate(event.info?.eventDate as string | undefined)}
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
