-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "password" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "maxVotes" INTEGER,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "pollId" TEXT NOT NULL,
    CONSTRAINT "Option_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "like" INTEGER NOT NULL DEFAULT 0,
    "love" INTEGER NOT NULL DEFAULT 0,
    "wow" INTEGER NOT NULL DEFAULT 0,
    "sad" INTEGER NOT NULL DEFAULT 0,
    "pollId" TEXT NOT NULL,
    CONSTRAINT "Reaction_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "showResults" BOOLEAN NOT NULL DEFAULT true,
    "allowMultipleVotes" BOOLEAN NOT NULL DEFAULT false,
    "pollId" TEXT NOT NULL,
    CONSTRAINT "Settings_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "primaryColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    CONSTRAINT "Theme_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "browserId" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PollInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "votedAt" DATETIME,
    CONSTRAINT "PollInvitation_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "adminPassword" TEXT NOT NULL,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "smtpFrom" TEXT,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
    "smtpAuth" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_pollId_key" ON "Reaction"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_pollId_key" ON "Settings"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_pollId_key" ON "Theme"("pollId");

-- CreateIndex
CREATE INDEX "Vote_ip_idx" ON "Vote"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_pollId_fingerprint_key" ON "Vote"("pollId", "fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_pollId_browserId_key" ON "Vote"("pollId", "browserId");

-- CreateIndex
CREATE UNIQUE INDEX "PollInvitation_token_key" ON "PollInvitation"("token");

-- CreateIndex
CREATE INDEX "PollInvitation_token_idx" ON "PollInvitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PollInvitation_pollId_email_key" ON "PollInvitation"("pollId", "email");
