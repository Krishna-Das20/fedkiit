
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

import { api } from "../../../../../services";
import { ComponentLoading } from "../../../../../microInteraction";
import styles from "./styles/VerifyCertificate.module.scss";

const VerifyCertificate = () => {
  const searchParams = useSearchParams();
  const certificateId = searchParams.get("id");

  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchCertificate = async () => {
      if (!certificateId) {
        setError("No certificate ID provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setCertificateData(null);

      try {
        const response = await api.post(
          "/api/certificate/verifyCertificate",
          { id: certificateId }
        );

        if (cancelled) return;

        const data = response.data;
        const certificate = data?.certificate;

        if (!data?.imageSrc || !certificate) {
          setError("Invalid certificate data.");
          return;
        }

        setCertificateData({
          imageSrc: data.imageSrc,
          certificateId: certificate.certificateId || certificateId,
          name:
            certificate.fieldValues?.name ||
            certificate.fieldValues?.Name ||
            certificate.fieldValues?.recipient_name ||
            "N/A",
          email: certificate.email || "N/A",
          event: data.event?.name || "N/A",
          date: data.event?.createdAt || null,
        });
      } catch (err) {
        if (cancelled) return;

        setError(
          err?.response?.data?.message ||
            "Certificate not found or has been revoked."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCertificate();

    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  const handleDownload = () => {
    if (!certificateData?.imageSrc) return;

    const link = document.createElement("a");
    link.href = certificateData.imageSrc;
    link.download = `Certificate_${certificateData.certificateId}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyLink = async () => {
    const url = currentUrl || window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the link. Please copy it from your browser.");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <ComponentLoading />
        <p>Verifying certificate...</p>
      </div>
    );
  }

  if (error || !certificateData) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>
          Certificate <span>Verification</span>
        </h1>

        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>✕</div>
          <h3>Invalid Certificate ID</h3>
          <p>{error || "Certificate data could not be loaded."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Certificate <span>Verification</span>
      </h1>

      <div className={styles.contentWrapper}>
        <div className={styles.imageContainer}>
          <img
            src={certificateData.imageSrc}
            alt="Verified Certificate"
          />
        </div>

        <div className={styles.detailsContainer}>
          <table className={styles.detailsTable}>
            <tbody>
              <tr>
                <th>Certificate ID:</th>
                <td>{certificateData.certificateId}</td>
              </tr>

              <tr>
                <th>Name:</th>
                <td>{certificateData.name}</td>
              </tr>

              <tr>
                <th>Event:</th>
                <td>{certificateData.event}</td>
              </tr>

              <tr>
                <th>Email:</th>
                <td>{certificateData.email}</td>
              </tr>

              {certificateData.date && (
                <tr>
                  <th>Event Date:</th>
                  <td>
                    {new Date(
                      certificateData.date
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className={styles.bottomRow}>
            <div className={styles.actionButtons}>
              <div className={styles.verifiedTag}>
                <CheckCircle />
                <span style={{ color: "white" }}>
                  Verified by FEDKIIT
                </span>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  className={styles.downloadBtn}
                  onClick={handleDownload}
                >
                  Download
                </button>

                <button
                  className={styles.downloadBtn}
                  onClick={copyLink}
                >
                  {copied ? "Copied..." : "Copy Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
