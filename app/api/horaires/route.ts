import localData from "@/data/horaires.json";
import { NextResponse } from "next/server";

// 👉 colle ici l’ID du fichier Google Drive
const FILE_ID = process.env.HORAIRES_JSON_ID!;

export async function GET() {
  try {
    // URL spéciale de téléchargement Drive
    const url = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Drive inaccessible");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.log("⚠️ Drive indisponible → fallback local utilisé");
    return NextResponse.json(localData);
  }
}
