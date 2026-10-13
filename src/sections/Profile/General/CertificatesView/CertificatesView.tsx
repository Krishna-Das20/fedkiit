"use client";

import { useContext, useEffect, useState } from "react";
import styles from "./styles/CertificatesView.module.scss";
import AuthContext from "../../../../context/AuthContext";

import { api } from "../../../../services";
import { ComponentLoading } from "../../../../microInteraction";
import { Send } from "lucide-react";
import Link from "next/link";
import type { FormRecord } from "@/src/types/form";
import type { MyCertificate } from "@/src/types/certificate";

/** Older stored forms also carry a Mongo-style `_id`. */
type ListedForm = FormRecord & { _id?: string };

const Events = () => {
  const authCtx = useContext(AuthContext);
  const [events, setEvents] = useState<ListedForm[]>([]);
  const [myCertificates, setMyCertificates] = useState<MyCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string } | null>(null);
  const viewPath = "/profile/Events";
  const SendCertificatePath = "/profile/events/SendCertificate";
  const analyticsPath = "/profile/events/Analytics";
  const createCertificatesPath = "/profile/events/createCertificates";
  const viewCertificatesPath = "/profile/events/viewCertificates";


  const analyticsAccessRoles = [
    "PRESIDENT",
    "VICEPRESIDENT",
    "DIRECTOR_CREATIVE",
    "DIRECTOR_TECHNICAL",
    "DIRECTOR_MARKETING",
    "DIRECTOR_OPERATIONS",
    "DIRECTOR_SPONSORSHIP",
    "ADMIN",
  ];

  // Presidency, directors, admins and the senior-executive account manage
  // certificates for every event. Everyone else sees only the certificates
  // issued to them — the events they took part in, whether before or after
  // joining FED. Attendance plays no part: several events issued certificates
  // without ever scanning attendance.
  const canManageCertificates =
    analyticsAccessRoles.includes(authCtx?.user?.access) ||
    authCtx?.user?.email == "srex@fedkiit.com";

  useEffect(() => {
    if (canManageCertificates || !authCtx?.user?.email) return;

    const fetchMyCertificates = async () => {
      try {
        const response = await api.get("/api/certificate/myCertificates");
        const certificates: MyCertificate[] = response.data?.certificates ?? [];
        setMyCertificates(
          // A missing date sorts as the epoch, which is what new Date(null) gave.
          [...certificates].sort((a, b) => new Date(b.eventDate ?? 0).getTime() - new Date(a.eventDate ?? 0).getTime()),
        );
      } catch (error) {
        setError({
          message:
            "Sorry for the inconvenience, we are having issues fetching your Certificates",
        });
        console.error("Error fetching certificates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCertificates();
  }, [authCtx?.user?.email, canManageCertificates]);

  useEffect(() => {
    if (!canManageCertificates) return;

    const fetchEventsData = async () => {
      try {
        const response = await api.get("/api/form/getAllForms");
        const userEvents = authCtx.user.regForm;

        if (response.status === 200) {
          const fetchedEvents: ListedForm[] = response.data.events;
          if (authCtx?.user?.access !== "USER") {
            // Set events for non-users
            setEvents(sortEventsByDate(fetchedEvents));
          } else {
            // Filter and then sort events for users
            const filteredEvents = fetchedEvents.filter((event) =>
              userEvents.includes(event.id)
            );
            setEvents(sortEventsByDate(filteredEvents));
          }
        } else {
          console.error("Error fetching event data:", response.data.message);
          setError({
            message:
              "Sorry for the inconvenience, we are having issues fetching your Events",
          });
        }
      } catch (error) {
        setError({
          message:
            "Sorry for the inconvenience, we are having issues fetching your Events",
        });
        console.error("Error fetching team members:", error);

        // const userEvents = authCtx.user.regForm;
        // // using local JSON data
        // let localEvents = eventsData.events;
        // if (authCtx?.user?.access !== "USER") {
        //   setEvents(sortEventsByDate(localEvents));
        // } else {
        //   const filteredEvents = localEvents.filter((event) =>
        //     userEvents.includes(event._id)
        //   );
        //   setEvents(sortEventsByDate(filteredEvents));
        // }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventsData();
  }, [authCtx?.user?.email, canManageCertificates]);

  const sortEventsByDate = (events: ListedForm[]) => {
    return events.sort((a, b) => new Date(b.info.eventDate as string).getTime() - new Date(a.info.eventDate as string).getTime());
  };

  const formatDate = (dateString: string | undefined) => {
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString as string)
      .toLocaleDateString("en-GB", options)
      .replace(/\//g, "-");
  };

  // console.log("Event Access",authCtx?.user?.access);
  if (!canManageCertificates) {
    return (
      <div className={styles.participatedEvents}>
        <div className={styles.proHeading}>
          <h3 className={styles.headInnerText}>
            <span>Your</span> Certificates
          </h3>
        </div>

        {isLoading ? (
          <ComponentLoading />
        ) : (
          <>
            {error && <div className={styles.error}>{error.message}</div>}

            <div className={styles.tables}>
              {myCertificates.length > 0 ? (
                <table className={styles.eventsTable}>
                  <thead>
                    <tr>
                      <th className={styles.mobilewidth}>Event Name</th>
                      <th className={styles.mobilewidth}>Event Date</th>
                      <th className={styles.mobilewidth}>Certificate</th>
                    </tr>
                  </thead>

                  <tbody>
                    {myCertificates.map((certificate) => (
                      <tr key={certificate.certificateId}>
                        <td className={styles.mobilewidth} style={{ fontWeight: "500", paddingRight: "10px" }}>
                          {certificate.eventTitle}
                        </td>
                        <td style={{ fontWeight: "200" }}>
                          {certificate.eventDate ? formatDate(certificate.eventDate) : "—"}
                        </td>
                        <td>
                          <Link
                            href={`/verify/certificate?id=${encodeURIComponent(certificate.certificateId)}`}
                            target="_blank"
                            rel="noopener noreferrer"
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                !error && <p className={styles.noEvents}>No certificates have been issued to you yet</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.participatedEvents}>
      {authCtx?.user?.access !== "USER" ? (
        <div className={styles.proHeading}>
          <h3 className={styles.headInnerText}>
            <span>Events</span> Timeline
          </h3>
        </div>
      ) : (
        <div className={styles.proHeading}>
          <h3 className={styles.headInnerText}>
            <span>Participated</span> Events
          </h3>
        </div>
      )}

      {isLoading ? (
        <ComponentLoading />
      ) : (
        <>
          {error && <div className={styles.error}>{error.message}</div>}

          <div className={styles.tables}>
            {events.length > 0 ? (
              <table className={styles.eventsTable}>
                <thead>
                  <tr>
                    <th className={styles.mobilewidth}>Event Name</th>
                    <th className={styles.mobilewidth}>Event Date</th>
                    {(analyticsAccessRoles.includes(authCtx?.user?.access) || authCtx?.user?.email == "srex@fedkiit.com") && (
                      <>
                        <th className={styles.mobilewidth}>Create/Edit</th>
                        <th className={styles.mobilewidth}>Manage Mails</th>
                        <th className={styles.mobilewidth}>Certificates</th>
                      </>
                    )}
                    {/* Add more headers */}
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event.id || event._id}>
                      <td className={styles.mobilewidth} style={{ fontWeight: "500", paddingRight: "10px" }}>
                        {event.info.eventTitle}
                      </td>
                      <td style={{ fontWeight: "200" }}>
                        {formatDate(event.info.eventDate)}
                      </td>

                      {(analyticsAccessRoles.includes(authCtx?.user?.access) || authCtx?.user?.email == "srex@fedkiit.com") && (
                        [createCertificatesPath, SendCertificatePath, viewCertificatesPath].map((basePath) => (
                          <td key={basePath}>
                            <Link href={`${basePath}/${event.id}`}>
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
                        ))
                      )}

                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.noEvents}>Not participated in any Events</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Events;
