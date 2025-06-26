"use client";

import React from "react";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-[#2f2a51] p-6 flex flex-col justify-between z-50 rounded-r-3xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/sino.png" alt="Logo" className="w-6 h-6" />
              <h1 className="text-xl font-bold text-[#A8A4F8]">YouVerse</h1>
            </div>
            <button onClick={onClose} className="text-white text-xl">
              ❌
            </button>
          </div>

          <nav className="flex flex-col space-y-4 text-[#A8A4F8]">
            <button className="flex items-center space-x-2 text-left hover:text-white transition">
              <span>💜</span>
              <span>Match</span>
            </button>
            <button className="flex items-center space-x-2 bg-[#1F1F26] text-white px-4 py-2 rounded-full font-semibold shadow">
              <span>⭐</span>
              <span>Interests</span>
            </button>
          </nav>
        </div>

        <div className="space-y-4 text-[#A8A4F8]">
          <button className="flex items-center space-x-2 hover:text-white transition">
            <span>↩️</span>
            <span>Logout</span>
          </button>
          <div className="flex items-center space-x-2 bg-[#1F1F26] px-4 py-2 rounded-full">
            <span>🟣</span>
            <span>Your Name</span>
          </div>
        </div>
      </div>

      {/* Botão do sino para abrir o menu se estiver fechado */}
      {!isOpen && (
        <button
          onClick={onClose}
          aria-label="Abrir menu"
          className="fixed top-10 left-10 z-50 bg-[#2f2a51] p-3 rounded-2xl shadow-lg border border-[#7471D9] hover:scale-105 transition-transform duration-200"
        >
          <img src="/sino.png" alt="Abrir menu" className="w-8 h-8" />
        </button>
      )}
    </>
  );
}
