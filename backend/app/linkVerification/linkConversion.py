from pathlib import Path
import yt_dlp
import whisper
from yt_dlp.utils import DownloadError
import ssl
import sys
import json
from typing import Dict, Any, Optional

# Insecure SSL workaround. Only use if you cannot fix certificates.
ssl._create_default_https_context = ssl._create_unverified_context

# Load the Whisper model once at import time to avoid reloading for each call.
model = whisper.load_model("small")

def tikTokConversion(link: str) -> Dict[str, Any]:
    # Create directories if they do not exist.
    audio_dir = Path("data/audio")
    transcript_dir = Path("data/transcripts")
    audio_dir.mkdir(parents=True, exist_ok=True)
    transcript_dir.mkdir(parents=True, exist_ok=True)

    
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": str(audio_dir / "%(id)s.%(ext)s"),
        "postprocessors": [
            {"key": "FFmpegExtractAudio", "preferredcodec": "m4a"}
        ],
        "quiet": True,
        "logtostderr": True,
        "no_warnings": True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(link, download=True)
        
        if info is None:
            return {"success": False, "error": "Failed to extract video info"}
            
        video_id = info.get('id')
        if not video_id:
            return {"success": False, "error": "No video ID found"}
            
        audio_path = audio_dir / f"{video_id}.m4a"

        if not audio_path.exists():
            return {"success": False, "error": f"Audio file not created: {audio_path}"}

        result = model.transcribe(str(audio_path))
        text = result.get("text", "")
        if text:
            text = text.strip()
        
        if not text:
            return {"success": False, "error": "Transcription returned empty text"}

        transcript_path = transcript_dir / f"{video_id}.txt"
        transcript_path.write_text(text, encoding="utf-8")

        return {
            "success": True,
            "audio_file": str(audio_path),
            "transcript_file": str(transcript_path),
            "transcript_text": text,
            "video_title": info.get("title", "Unknown"),
        }

    except DownloadError as e:
        return {"success": False, "error": f"Download failed: {e}"}
    except Exception as e:
        return {"success": False, "error": f"Unexpected error: {e}"}

# Command line interface
if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        result = tikTokConversion(url)
        print(json.dumps(result))
    else:
        print(json.dumps({"success": False, "error": "No URL provided"}))
        