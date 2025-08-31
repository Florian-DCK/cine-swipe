-- CreateTable
CREATE TABLE "public"."Film" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "poster_path" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "genre_ids" INTEGER[],
    "vote_average" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latestListId" INTEGER,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LatestList" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LatestList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Film" ADD CONSTRAINT "Film_latestListId_fkey" FOREIGN KEY ("latestListId") REFERENCES "public"."LatestList"("id") ON DELETE SET NULL ON UPDATE CASCADE;
