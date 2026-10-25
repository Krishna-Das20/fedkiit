"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { Blurhash } from "react-blurhash";
import { cdn } from "../../utils/cloudinary";
import styles from "./styles/TeamCard.module.scss";
import TeamCardSkeleton from "../../layouts/Skeleton/TeamCard/TeamCard";
import { Button } from "../Core";
import AuthContext from "../../context/AuthContext";
import type { Member, MemberExtra } from "../../types/member";
import PixelTransition, {
  type PixelPattern,
  type PixelAnimation,
  type PixelShape,
} from "../PixelTransition/PixelTransition";

type TeamCardProps = {
  member: Member;
  blurhash?: string;
  /** Extra class names, keyed by the stylesheet class they add to. */
  customStyles?: Record<string, string>;
  onUpdate?: () => void;
  onRemove?: () => void;
  pixelColor?: string;
  mosaic?: number;
  gridSize?: number;
  pattern?: PixelPattern;
  pixelAnimation?: PixelAnimation;
  pixelShape?: PixelShape;
  animationStepDuration?: number;
};

const TeamCard = ({
  member,
  blurhash,
  customStyles = {},
  onUpdate,
  onRemove,
  pixelColor = "#000000",
  mosaic = 0.15,
  gridSize = 10,
  pattern = "random",
  pixelAnimation = "pop",
  pixelShape = "square",
  animationStepDuration = 0.4,
}: TeamCardProps) => {
  const [showMore, setShowMore] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const rawExtra = member?.extra;
  let parsedExtra: MemberExtra = {};
  if (typeof rawExtra === "string") {
    try {
      parsedExtra = JSON.parse(rawExtra);
    } catch {
      parsedExtra = {};
    }
  } else if (typeof rawExtra === "object" && rawExtra !== null) {
    parsedExtra = rawExtra;
  }

  const extraData = {
    linkedin: parsedExtra.linkedin || member?.linkedin || "",
    github: parsedExtra.github || member?.github || "",
    know: parsedExtra.know || member?.know || "",
    designation: parsedExtra.designation || member?.designation || "",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 500); // Show skeleton for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsImageLoaded(true);
    }
  }, [member?.img]);

  const authCtx = useContext(AuthContext);

  const isDirectorRole =
    ["PRESIDENT", "VICEPRESIDENT"].includes(member?.access ?? "") ||
    member?.access?.startsWith("DIRECTOR_");

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleImageError = () => {
    setIsImageLoaded(false);
  };

  const handleLink = (url: string | undefined) => {
    const trimmed = (url || "").trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return "https://" + trimmed;
  };

  const isExtraDataEmpty = () => {
    return (
      !extraData?.designation &&
      !extraData?.linkedin &&
      !extraData?.github &&
      !extraData.know
    );
  };


  //for name overflow

  const nameRef = useRef<HTMLHeadingElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (nameRef.current) {
      setIsOverflowing(nameRef.current.scrollWidth > nameRef.current.clientWidth);
    }
  }, [member.name]);

  const firstContent = (
    <div
      className={`${styles.teamMemberFront} ${
        customStyles.teamMemberFront || ""
      }`}
    >
      <div className={`${styles.ImgDiv} ${customStyles.ImgDiv || ""}`}>
        {!isImageLoaded && (
          <Blurhash
            hash="LEG8_%els7NgM{M{RiNI*0IVog%L"
            width={"100%"}
            height={"100%"}
            resolutionX={32}
            resolutionY={32}
            punch={1}
          />
        )}
        <img
          ref={imgRef}
          src={cdn(member?.img, 600)}
          alt={`Profile of ${member?.name}`}
          className={`${styles.teamMemberImg} ${
            customStyles.teamMemberImg || ""
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: isImageLoaded ? "block" : "none" }}
        />
      </div>
      <div
        className={`${styles.teamMemberInfo} ${
          customStyles.teamMemberInfo || ""
        }`}
      >
        <h4
          ref={nameRef}
          className={`${styles.memName} ${isOverflowing ? styles.responsive : ""}`}
          style={{ color: "#000" }}
        >
          {member?.name}
        </h4>
      </div>
    </div>
  );

  const secondContent = (
    <div
      className={`${styles.teamMemberBack} ${
        customStyles.teamMemberBack || ""
      }`}
    >
      {!showMore ? (
        <>
          {extraData.designation && (
            <h5
              className={`${customStyles.teamMemberBackh5 || ""}`}
              style={{ color: "#fff" }}
            >
              {extraData.designation}
            </h5>
          )}
          <div
            className={`${styles.socialLinks} ${
              customStyles.socialLinks || ""
            }`}
          >
            {extraData?.linkedin && (
              <a
                href={handleLink(extraData?.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${customStyles.socialLinksa || ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                <FaLinkedin />
              </a>
            )}
            {extraData?.github && (
              <a
                href={handleLink(extraData?.github)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${customStyles.socialLinksa || ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                <FaGithub />
              </a>
            )}
          </div>
          {!isExtraDataEmpty() && isDirectorRole && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMore(true);
              }}
              aria-expanded={showMore}
              className={`${customStyles.button || ""}`}
            >
              Know More
            </button>
          )}
          {isExtraDataEmpty() ? (
            <div
              className={`${styles.knowPara} ${customStyles.knowPara || ""}`}
            >
              <p>Nothing to show</p>
            </div>
          ) : null}
          {onUpdate && authCtx.user.access === "ADMIN" && (
            <div
              className={`${styles.updatebtn} ${
                customStyles.updatebtn || ""
              }`}
            >
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onUpdate) {
                    authCtx.memberData = member;
                    onUpdate();
                  }
                }}
              >
                Update
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const isConfirmed = window.confirm(
                    `Do you really want to remove this member "${member?.name}"?`
                  );
                  if (isConfirmed && onRemove) {
                    authCtx.memberData = member;
                    onRemove();
                  }
                }}
              >
                Remove
              </Button>
            </div>
          )}
        </>
      ) : (
        <div
          className={`${styles.knowMoreContent} ${
            customStyles.knowMoreContent || ""
          }`}
        >
          {extraData.know && (
            <div
              className={`${styles.knowPara} ${
                customStyles.knowPara || ""
              }`}
            >
              <p>{extraData.know}</p>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMore(false);
            }}
            aria-expanded={showMore}
            className={`${customStyles.button || ""}`}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${styles.teamMember} ${customStyles.teamMember || ""}`}>
      {/*
        The card mounts behind the skeleton (hidden) rather than after it, so
        the photo starts loading straight away instead of 500ms later.
        PixelTransition sizes its canvas when the card becomes visible.
      */}
      {showSkeleton && <TeamCardSkeleton customStyles={customStyles} />}
      <div
        className={styles.teamMemberInner}
        style={{ display: showSkeleton ? "none" : "block" }}
      >
        <PixelTransition
          firstContent={firstContent}
          secondContent={secondContent}
          gridSize={gridSize}
          pixelColor={pixelColor}
          mosaic={mosaic}
          animationStepDuration={animationStepDuration}
          pattern={pattern}
          randomness={0.3}
          pixelAnimation={pixelAnimation}
          pixelShape={pixelShape}
          gap={0}
          fps={0}
          trigger="hover"
          once={false}
          className={styles.pixelCard}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};

export default TeamCard;
