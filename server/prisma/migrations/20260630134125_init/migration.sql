-- CreateEnum
CREATE TYPE "Role" AS ENUM ('INSPECTOR', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'DRAFT');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('ROUTINE', 'FOLLOW_UP', 'COMPLAINT', 'EXTRAORDINARY');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'RETURNED', 'ESCALATED');

-- CreateTable
CREATE TABLE "Inspector" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "officeName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'INSPECTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "licenseType" TEXT,
    "licenseDetails" TEXT,
    "year" TEXT,
    "category" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "facilityName" TEXT NOT NULL,
    "facilityAddress" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3),
    "inspectorName" TEXT NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "inspectionType" "InspectionType" NOT NULL DEFAULT 'ROUTINE',
    "priorInspectionId" TEXT,
    "openingMeetingDone" BOOLEAN NOT NULL DEFAULT false,
    "closingMeetingDone" BOOLEAN NOT NULL DEFAULT false,
    "score" DOUBLE PRECISION,
    "grade" TEXT,
    "riskLevel" INTEGER,
    "criticalOverride" BOOLEAN NOT NULL DEFAULT false,
    "incomplete" BOOLEAN NOT NULL DEFAULT false,
    "nextInspectionDays" INTEGER,
    "violationsHigh" INTEGER NOT NULL DEFAULT 0,
    "violationsMedium" INTEGER NOT NULL DEFAULT 0,
    "violationsLow" INTEGER NOT NULL DEFAULT 0,
    "violationsTotal" INTEGER NOT NULL DEFAULT 0,
    "escalationOverrideReason" TEXT,
    "signature" TEXT,
    "officeName" TEXT,
    "inspectionCause" TEXT,
    "referenceDocument" TEXT,
    "committeeMembers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "integrityHash" TEXT,
    "geofenceOverrideNote" TEXT,
    "reportSequenceNumber" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "returnedReason" TEXT,
    "approvalNote" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "supervisorId" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveAction" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "inspectionItemId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "facilityName" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "CorrectiveAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaItem" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "facilityName" TEXT NOT NULL,
    "facilityAddress" TEXT,
    "activity" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "inspectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inspector_matricule_key" ON "Inspector"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_inspectionId_key" ON "Approval"("inspectionId");

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "Inspector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "Inspector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Inspector"("id") ON DELETE SET NULL ON UPDATE CASCADE;
