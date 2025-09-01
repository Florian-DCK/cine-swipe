'use client';
import React, { use, useEffect, useState } from 'react';
import { getGenreNameFromTMDB, getVideoFromTMDB } from '../actions/films';
import { Info, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Backdrop } from '@mui/material';

type FilmCardProps = {
    id: number;
    title: string;
    posterPath: string;
    overview: string;
    releaseDate: string;
    genreIds: number[];
    voteAverage: number;
    runtime: number | null;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
};

const GenreBadge: React.FC<{ genre: string }> = ({ genre }) => {
    return (
        <span className='inline-block bg-background text-white-faded rounded-sm px-2 py-1 text-sm font-semibold mr-2'>
            {genre}
        </span>
    );
};

const FilmNoteVisual: React.FC<{ voteAverage: number }> = ({ voteAverage }) => {
    const percentage = Math.round(voteAverage * 10); // 0-100
    const radius = 28;
    const stroke = 6;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Interpolation de couleur entre rouge (#ff3b30) et vert (#4cd964)
    const interpolateColor = (percent: number) => {
        const r1 = 0xff, g1 = 0x3b, b1 = 0x30; // rouge
        const r2 = 0x4c, g2 = 0xd9, b2 = 0x64; // vert
        const r = Math.round(r1 + (r2 - r1) * (percent / 100));
        const g = Math.round(g1 + (g2 - g1) * (percent / 100));
        const b = Math.round(b1 + (b2 - b1) * (percent / 100));
        return `rgb(${r},${g},${b})`;
    };

    const strokeColor = interpolateColor(percentage);

    return (
        <svg
            height={radius * 2}
            width={radius * 2}
            className="block mx-auto"
        >
            <circle
                stroke="#444"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke={strokeColor}
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                style={{ transition: 'stroke-dashoffset 0.5s, stroke 0.5s' }}
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                fill={strokeColor}
                fontSize="0.9em"
                fontWeight="bold"
            >
                {percentage}%
            </text>
        </svg>
    );
};

const FilmInfoPopup: React.FC<{ overview: string; releaseDate: string; voteAverage: number; videoId?: string | null; runtime?: number | null }> = ({ overview, releaseDate, voteAverage, videoId, runtime }) => {
    return (
        <div className='p-4 bg-primary text-background rounded absolute bottom-0 z-50 font-bold'>
            <p className='mb-1 text-center max-h-60 overflow-scroll'>{overview}</p>
            <hr />
            <div className='grid grid-cols-3 items-center justify-center bg-background/70 my-5 py-2 rounded-lg text-primary'>
                <p className='mb-1 text-center'>{releaseDate}</p>
                <FilmNoteVisual voteAverage={voteAverage} />
                <p className='text-center'>{runtime != null ? `${Math.floor(runtime / 60)}h ${runtime % 60}min` : ""}</p>
            </div>
            {videoId && (
                <div className="flex justify-center my-4">
                    <iframe
                        width="320"
                        height="180"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="Trailer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded"
                    />
                </div>
            )}
        </div>
    );
};

const AcceptIndicator: React.FC<{opacity: number}> = ({ opacity }) => {
    return (
        <div className={`absolute top-1/2 -translate-y-1/2 transform right-0 p-2 h-1/2 w-10 bg-gradient-to-l from-green-600 to-transparent rounded-s-full`} style={{ opacity }}>
            <ThumbsUp className='size-20 text-green-600 mx-auto absolute top-1/2 -translate-y-1/2 right-5' />
        </div>
    );
};

const DenyIndicator: React.FC<{opacity: number}> = ({ opacity }) => {
    return (
        <div className={`absolute top-1/2 -translate-y-1/2 transform left-0 p-2 h-1/2 w-10 bg-gradient-to-r from-red-600 to-transparent rounded-e-full`} style={{ opacity }}>
            <ThumbsDown className='size-20 text-red-600 mx-auto absolute top-1/2 -translate-y-1/2 left-5' />
        </div>
    );
};

const FilmCard: React.FC<FilmCardProps> = (props) => {
    const [genreNames, setGenreNames] = useState<string[]>([]);
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [videoId, setVideoId] = useState<string | null>(null);

    // Pour le swipe
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchEndX, setTouchEndX] = useState<number | null>(null);
    const [translateX, setTranslateX] = useState<number>(0);
    const [isSwiping, setIsSwiping] = useState<boolean>(false);

    const handleSwipeLeft = () => {
        if (props.onSwipeLeft) props.onSwipeLeft();
    };

    const handleSwipeRight = () => {
        if (props.onSwipeRight) props.onSwipeRight();
    };

    const minSwipeDistance = 50; // px

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEndX(null); // Reset
        setTouchStartX(e.targetTouches[0].clientX);
        setIsSwiping(true);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (touchStartX !== null) {
            const currentX = e.targetTouches[0].clientX;
            setTranslateX(currentX - touchStartX);
            setTouchEndX(currentX);
        }
    };

    const onTouchEnd = () => {
        setIsSwiping(false);
        if (touchStartX === null || touchEndX === null) {
            setTranslateX(0);
            return;
        }
        const distance = touchStartX - touchEndX;
        if (distance > minSwipeDistance) {
            setTranslateX(-300); // Animation vers la gauche
            setTimeout(() => {
                setTranslateX(0);
                handleSwipeLeft();
            }, 200);
        } else if (distance < -minSwipeDistance) {
            setTranslateX(300); // Animation vers la droite
            setTimeout(() => {
                setTranslateX(0);
                handleSwipeRight();
            }, 200);
        } else {
            setTranslateX(0); // Retour au centre
        }
        setTouchStartX(null);
        setTouchEndX(null);
    };

    useEffect(() => {
        const fetchGenres = async () => {
            const names = await Promise.all(
                props.genreIds.map((genreId) => getGenreNameFromTMDB(genreId))
            );
            setGenreNames(Array.from(new Set(names.filter(Boolean))));
        };
        const fetchVideos = async () => {
            const videos = await getVideoFromTMDB(props.id);
            // Cherche la première vidéo YouTube de type "Trailer"
            const trailer = videos?.find(
                (v: any) => v.site === "YouTube" && v.type === "Trailer"
            );
            setVideoId(trailer?.key || null);
        };
        fetchGenres();
        fetchVideos();
    }, [props.genreIds, props.id]);

    // Ajoute cet effet pour "mettre en pause" la vidéo
    useEffect(() => {
        if (!showInfo) {
            setVideoId(null);
        } else {
            // Recharge la vidéo quand on ouvre
            getVideoFromTMDB(props.id).then(videos => {
                const trailer = videos?.find(
                    (v: any) => v.site === "YouTube" && v.type === "Trailer"
                );
                setVideoId(trailer?.key || null);
            });
        }
    }, [showInfo, props.id]);

    const maxSwipe = 150;
    const acceptOpacity = translateX > 0 ? Math.min(translateX / maxSwipe, 1) : 0;
    const denyOpacity = translateX < 0 ? Math.min(-translateX / maxSwipe, 1) : 0;

    const maxTilt = 15;
    const tilt = (translateX / maxSwipe) * maxTilt;
    const tiltClamped = Math.max(Math.min(tilt, maxTilt), -maxTilt);

    return (
        <>
            <div
                className='p-4 rounded max-w-sm bg-primary/85 text-background relative transition-all'
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    transform: `translateX(${translateX}px) rotate(${tiltClamped}deg)`,
                    transition: isSwiping ? 'none' : 'transform 0.2s cubic-bezier(.4,2,.6,1)',
                    touchAction: 'pan-y'
                }}
            >
                <h2 className='text-2xl font-bold text-center mb-4 uppercase'>{props.title}</h2>
                <img src={props.posterPath} alt={props.title} className='w-full h-auto' />
                <div className='flex flex-wrap my-4 justify-center space-y-2'>
                    {genreNames.map((genre) => (
                        <GenreBadge key={genre} genre={genre} />
                    ))}
                </div>
            </div>

            {/* Bouton info fixé au viewport, toujours visible */}
            {!showInfo && (
                <button
                    onClick={() => setShowInfo(true)}
                    className='fixed bottom-8 right-8 cursor-pointer text-primary z-50 bg-background/80 rounded-full p-3 shadow-lg'
                >
                    <Info className='size-10' />
                </button>
            )}
            <AcceptIndicator opacity={acceptOpacity} />
            <DenyIndicator opacity={denyOpacity} />

            {/* Backdrop au niveau du document */}
            <Backdrop open={showInfo} onClick={() => setShowInfo(false)} className='z-50'>
                <FilmInfoPopup
                    overview={props.overview}
                    releaseDate={props.releaseDate}
                    voteAverage={props.voteAverage}
                    videoId={showInfo ? videoId : null}
                    runtime={props.runtime}
                />
            </Backdrop>
        </>
    );
};

export default FilmCard;