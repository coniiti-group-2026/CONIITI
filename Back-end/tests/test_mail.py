import asyncio
import aiosmtplib
import sys
from email.mime.text import MIMEText

async def main():
    try:
        msg = MIMEText("Test Email")
        msg["Subject"] = "Test"
        msg["From"] = "coniitiadmin@gmail.com"
        msg["To"] = "kevisan58@gmail.com"
        
        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=587,
            username="coniitiadmin@gmail.com",
            password="zlbnmbrphyriqgkr",
            start_tls=True,
        )
        print("SMTP_SUCCESS")
    except Exception as e:
        print(f"SMTP_FAILED: {repr(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
