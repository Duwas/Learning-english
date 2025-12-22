"use client";
// component/layout/Footer.js
import React from "react";
import { Layout } from "antd";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Link from "next/link";
import "../../CSS/main-menu.css";
const { Footer } = Layout;

const MainFooter = () => {
  return (
    <Footer style={{ padding: 0, background: "#343a40" }}>
      <div className="bg-dark text-white-50 py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-2 mb-4 mb-md-0 border-end border-secondary px-3">
              <div className="d-flex align-items-center mb-3">
                <span className="text-white fw-bold fs-5 me-2">
                  <img
                    src="/img/Logo.png"
                    alt=""
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      marginRight: "20px",
                    }}
                  />
                  doubleK-Book
                </span>
              </div>
              <p className="small mb-1">&copy; Copyright 2016-2025</p>
              <p className="small mb-1">test-english.com</p>
              <p className="small mb-1">All rights reserved.</p>
              <p className="small">
                Made at{" "}
                <a
                  href="https://illadesideious.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none text-white-50"
                >
                  illadesideious.com
                </a>
              </p>
            </div>

            {/* Cột 2: Levels */}
            <div className="col-md-2 mb-4 mb-md-0 border-end border-secondary pe-3">
              <h5 className="text-white mb-3 fw-semibold">Levels</h5>
              <ul className="list-unstyled small">
                <li>
                  <Link
                    href="/levels/a1"
                    className="text-decoration-none text-white-50"
                  >
                    A1 Elementary
                  </Link>
                </li>
                <li>
                  <Link
                    href="/levels/a2"
                    className="text-decoration-none text-white-50"
                  >
                    A2 Pre-intermediate
                  </Link>
                </li>
                <li>
                  <Link
                    href="/levels/b1"
                    className="text-decoration-none text-white-50"
                  >
                    B1 Intermediate
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-md-2 mb-4 mb-md-0 border-end border-secondary px-3">
              <h5 className="text-white mb-3 fw-semibold">Info</h5>
              <ul className="list-unstyled small">
                <li>
                  <Link
                    href="/about"
                    className="text-decoration-none text-white-50"
                  >
                    About us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-decoration-none text-white-50"
                  >
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-decoration-none text-white-50"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookie-policy"
                    className="text-decoration-none text-white-50"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookie-declaration"
                    className="text-decoration-none text-white-50"
                  >
                    Cookie Declaration
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-md-2 mb-4 mb-md-0 border-end border-secondary px-3">
              <h5 className="text-white mb-3 fw-semibold">Get in Touch</h5>
              <ul className="list-unstyled small">
                <li>
                  <Link
                    href="/contact"
                    className="text-decoration-none text-white-50"
                  >
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/request-topic"
                    className="text-decoration-none text-white-50"
                  >
                    Request a topic for a lesson
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookie-consent"
                    className="text-decoration-none text-white-50"
                  >
                    Change your cookie consent
                  </Link>
                </li>
              </ul>

              <div className="mt-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white-50 me-3 fs-5"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white-50 me-3 fs-5"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white-50 me-3 fs-5"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white-50 fs-5"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            <div className="col-md-3 d-flex flex-column justify-content-start align-items-md-end">
              <Link
                href="/pro-upgrade"
                className="btn btn-pro-green btn-outline-light fw-semibold"
                style={{
                  width: "200px",
                  height: "45px",
                  borderColor: "white",
                  color: "white",
                }}
              >
                Upgrade to pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Footer>
  );
};

export default MainFooter;
