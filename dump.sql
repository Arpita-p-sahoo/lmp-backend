--
-- PostgreSQL database dump
--

\restrict TwLhPFBAFniukkW2eFPX3dsgUswjpEQfvOE4fe8h57cWzIqzb3lrNaeZJJGOGRZ

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comment_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_reactions (
    user_id uuid NOT NULL,
    comment_id uuid NOT NULL,
    type character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    question_id uuid NOT NULL,
    author_id uuid NOT NULL,
    text text NOT NULL,
    like_count integer DEFAULT 0 NOT NULL,
    dislike_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    company character varying NOT NULL,
    location character varying,
    type character varying(10),
    experience character varying,
    salary character varying,
    "techStack" text[] DEFAULT '{}'::text[] NOT NULL,
    description text,
    posted_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    tech_tag character varying NOT NULL,
    hashtags text[] DEFAULT '{}'::text[] NOT NULL,
    author_id uuid NOT NULL,
    vote_count integer DEFAULT 0 NOT NULL,
    comment_count integer DEFAULT 0 NOT NULL,
    is_hot boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: saved_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_jobs (
    user_id uuid NOT NULL,
    job_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: saved_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_questions (
    user_id uuid NOT NULL,
    question_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    "passwordHash" character varying,
    name character varying NOT NULL,
    "avatarUrl" character varying,
    designation character varying,
    organisation character varying,
    experience character varying,
    age smallint,
    gender character varying,
    dob date,
    "linkedinUrl" character varying,
    "techStack" text[] DEFAULT '{}'::text[] NOT NULL,
    streak integer DEFAULT 0 NOT NULL,
    "lastActive" date,
    "questionsPosted" integer DEFAULT 0 NOT NULL,
    "totalVotes" integer DEFAULT 0 NOT NULL,
    "googleId" character varying,
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "bannerUrl" character varying,
    address text,
    "highestEducation" character varying
);


--
-- Name: votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.votes (
    user_id uuid NOT NULL,
    question_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: comment_reactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comment_reactions (user_id, comment_id, type, created_at) FROM stdin;
67f6cd26-de80-4828-b0f9-ec08080ed79a	dbfe5fe3-680a-4fd1-98f6-07fd168105df	like	2026-03-26 15:49:41.979214
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comments (id, question_id, author_id, text, like_count, dislike_count, created_at) FROM stdin;
dbfe5fe3-680a-4fd1-98f6-07fd168105df	f3d191d7-7772-4b06-a36c-08c374ed117f	67f6cd26-de80-4828-b0f9-ec08080ed79a	Depends on your use case, REST works great for simple CRUD	1	0	2026-03-26 15:38:59.944001
6ae9f6ba-e209-4daa-8f42-5c038dab8b92	73cd5712-6153-45be-8e74-23f7d28b08db	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	xfsfsdfsfdsfd	0	0	2026-03-31 18:52:10.250084
690c4d21-c102-4e92-b56b-5405625451cb	73cd5712-6153-45be-8e74-23f7d28b08db	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	dfhfhfghfgh	0	0	2026-03-31 18:52:17.427056
044e3ed1-f6df-474c-a98c-8681dac95a91	73cd5712-6153-45be-8e74-23f7d28b08db	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	ddfgdfgdfgwerqre	0	0	2026-03-31 18:52:25.355536
2df3fec3-974b-494a-a0a8-eb309a58a9b1	218d19b6-43f4-411c-8880-0532c32cfeaa	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	gyutfgdfdstretr	0	0	2026-04-02 11:44:17.572254
2fa1acf0-92e6-4874-b49e-d621726b920d	bb73ae08-8ccc-482d-8512-9a3fdf2c74f8	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	oh same i got too	0	0	2026-04-02 11:53:04.713624
ff605b50-d45c-43f4-8498-a8c46f0845da	bb73ae08-8ccc-482d-8512-9a3fdf2c74f8	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	jhhjghjghj	0	0	2026-04-02 11:53:32.336661
8da585b8-43bb-4e6e-b0be-07bf7da82c0d	c4fb7aea-0eee-4527-b507-331824ff73aa	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	i know the answer	0	0	2026-04-03 12:51:45.107958
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobs (id, title, company, location, type, experience, salary, "techStack", description, posted_by, created_at) FROM stdin;
9d00bc08-7cbd-4b2e-b1c0-9f7067bf16ba	Senior Backend Developer	Infy	New York, NY	Remote	10+ years	$120k - $150k	{Java,Python,NestJS}	Looking for an experienced developer to join our fast-paced team...	67f6cd26-de80-4828-b0f9-ec08080ed79a	2026-03-26 19:15:15.641057
b2147b60-48ab-4bbc-b5b4-a083356365b8	Senior Angular Developer	Wipro	New York, NY	Onsite	4+ years	$120k - $150k	{Java,Python,NestJS}	Looking for an experienced developer to join our fast-paced team...	67f6cd26-de80-4828-b0f9-ec08080ed79a	2026-03-26 19:15:44.737068
c936bc08-62d8-48f2-bb8c-defc1f351857	Project Manager	Razopay	Kolkata	Onsite	5+ yrs	19-20 LPA	{SAP,Agile,LLM,AI}	Advanced Level\nHow does change detection work in Angular?\nWhat is the difference between ngIf and ngFor in terms of performance?\nWhat are lazy loaded modules and why are they used?\nHow do you optimize performance in a large Angular application?\nWhat is Zone.js and how does Angular use it?\n🔹 Practical / Real-world Questions\nHow would you build a dynamic form in Angular?\nHow do you handle API errors globally in Angular?\nHow do you implement authentication and route guards?\nHow do you manage state in Angular (NgRx, services, etc.)?	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	2026-04-03 18:08:19.971193
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1773921084921	CreateUsers1773921084921
2	1774266179988	CreateQuestions1774266179988
3	1774503766448	CreateComments1774503766448
4	1774526052033	CreateJobs1774526052033
5	1775200000000	AddUserProfileFields1775200000000
6	1775209000000	CreateSavedJobs1775209000000
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.questions (id, title, tech_tag, hashtags, author_id, vote_count, comment_count, is_hot, created_at, updated_at) FROM stdin;
bb73ae08-8ccc-482d-8512-9a3fdf2c74f8	what is promise in javascript? where do you use that?	JavaScript	{javascript,angular}	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	1	0	f	2026-04-02 11:12:51.92419	2026-04-02 15:51:54.487692
f3d191d7-7772-4b06-a36c-08c374ed117f	How Signal is different from RXJS subscribe?	Angular	{angular,ngrx,signals}	34569aab-996f-4444-be4e-1491877b70b2	2	0	f	2026-03-24 17:05:57.010649	2026-04-02 15:51:56.4266
5893676d-a7e0-4f46-8f13-a963dd08fa0d	How do you handle state management in large Angular applications?	Angular	{angular,state-management,ngrx}	67f6cd26-de80-4828-b0f9-ec08080ed79a	3	0	f	2026-03-23 17:21:43.873424	2026-04-02 15:51:57.093023
218d19b6-43f4-411c-8880-0532c32cfeaa	dummy anguar	Angular	{angular,svelte,nestjs,typescript}	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	2	-1	f	2026-04-02 11:43:54.363946	2026-04-02 15:58:05.853072
73cd5712-6153-45be-8e74-23f7d28b08db	How does Redis caching work in NestJS?	NestJS	{redis,caching,nestjs}	67f6cd26-de80-4828-b0f9-ec08080ed79a	3	-1	f	2026-03-27 17:06:56.220675	2026-04-02 15:58:26.770237
c4fb7aea-0eee-4527-b507-331824ff73aa	How does change detection work in Angular?	Angular	{angular,nestjs,express,javascript}	12bbf24c-9fe5-4043-b3d8-604ca7d2413a	1	1	f	2026-04-03 12:51:15.29287	2026-04-03 12:51:45.107958
4becfb06-012d-4598-9a10-f795684e9fd7	What are Angular lifecycle hooks? Explain a few like ngOnInit and ngOnDestroy.	Angular	{angular,next.js,go}	67f6cd26-de80-4828-b0f9-ec08080ed79a	0	0	f	2026-04-03 18:29:37.950589	2026-04-03 18:29:37.950589
\.


--
-- Data for Name: saved_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.saved_jobs (user_id, job_id, created_at) FROM stdin;
67f6cd26-de80-4828-b0f9-ec08080ed79a	b2147b60-48ab-4bbc-b5b4-a083356365b8	2026-04-03 18:37:28.91359
67f6cd26-de80-4828-b0f9-ec08080ed79a	9d00bc08-7cbd-4b2e-b1c0-9f7067bf16ba	2026-04-03 18:37:30.820726
\.


--
-- Data for Name: saved_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.saved_questions (user_id, question_id, created_at) FROM stdin;
34569aab-996f-4444-be4e-1491877b70b2	5893676d-a7e0-4f46-8f13-a963dd08fa0d	2026-03-24 17:30:00.197602
67f6cd26-de80-4828-b0f9-ec08080ed79a	c4fb7aea-0eee-4527-b507-331824ff73aa	2026-04-03 18:26:25.022511
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, "passwordHash", name, "avatarUrl", designation, organisation, experience, age, gender, dob, "linkedinUrl", "techStack", streak, "lastActive", "questionsPosted", "totalVotes", "googleId", "isVerified", "createdAt", "updatedAt", "bannerUrl", address, "highestEducation") FROM stdin;
67f6cd26-de80-4828-b0f9-ec08080ed79a	arpita@test.com	$2b$12$xkACxGTsNcCedVB6HPkDx.dVFzwknmMVZxeq//vC567ZoSmENnDMa	Arpita	\N	\N	\N	\N	\N	\N	\N	\N	{}	0	\N	3	6	\N	f	2026-03-19 19:25:06.77295	2026-04-03 18:29:38.102568	\N	\N	\N
1dd6bc83-d35b-4ef2-a3ce-6ccfa02082cb	rahul@test.com	$2b$12$EOUDVseI1xfxVUKtB78/weY0Gmc0MO4srA376qMaLcv0SMEYLXSaG	Rahul Dev	\N	Backend Engineer	LastMinPrep	\N	\N	\N	\N	\N	{}	0	\N	0	0	\N	f	2026-03-27 17:05:59.084723	2026-03-27 17:05:59.084723	\N	\N	\N
34569aab-996f-4444-be4e-1491877b70b2	sam@test.com	$2b$12$ysgDjKIU5akK90eORw2B.OZ01MpW0AEkdmsKPHnvf1OvSmKiBGr4W	Sam Mishra	https://example.com/avatar.png	Software Engineer	Infy	2 years	24	female	2002-01-15	https://www.linkedin.com/in/arpita-sahoo/	{Node.js,NestJS,PostgreSQL}	0	\N	1	2	\N	f	2026-03-24 17:03:34.17334	2026-04-02 15:51:56.4266	\N	\N	\N
12bbf24c-9fe5-4043-b3d8-604ca7d2413a	ankit@lmp.com	$2b$12$SaFBznBdOtNFyn5vv398V.YY.MBgUhyD3kE8ryJuwR5gbGWkXjxN2	Ankit Sharma		Sr QA Engineer	LMP	5-8 yrs	33	Male	1987-02-10		{QA,Angular,devOps}	0	\N	4	4	\N	f	2026-03-31 16:41:10.060533	2026-04-03 14:42:41.748385		Bhubaneswar,Odisha,India	
\.


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.votes (user_id, question_id, created_at) FROM stdin;
34569aab-996f-4444-be4e-1491877b70b2	5893676d-a7e0-4f46-8f13-a963dd08fa0d	2026-03-24 17:29:09.543971
1dd6bc83-d35b-4ef2-a3ce-6ccfa02082cb	73cd5712-6153-45be-8e74-23f7d28b08db	2026-03-27 17:11:26.849499
12bbf24c-9fe5-4043-b3d8-604ca7d2413a	73cd5712-6153-45be-8e74-23f7d28b08db	2026-03-31 18:52:02.557992
12bbf24c-9fe5-4043-b3d8-604ca7d2413a	f3d191d7-7772-4b06-a36c-08c374ed117f	2026-04-02 11:36:39.446471
12bbf24c-9fe5-4043-b3d8-604ca7d2413a	5893676d-a7e0-4f46-8f13-a963dd08fa0d	2026-04-02 11:36:41.456121
12bbf24c-9fe5-4043-b3d8-604ca7d2413a	218d19b6-43f4-411c-8880-0532c32cfeaa	2026-04-02 11:43:57.790904
67f6cd26-de80-4828-b0f9-ec08080ed79a	218d19b6-43f4-411c-8880-0532c32cfeaa	2026-04-02 15:51:51.606625
67f6cd26-de80-4828-b0f9-ec08080ed79a	bb73ae08-8ccc-482d-8512-9a3fdf2c74f8	2026-04-02 15:51:54.487692
67f6cd26-de80-4828-b0f9-ec08080ed79a	73cd5712-6153-45be-8e74-23f7d28b08db	2026-04-02 15:51:55.22374
67f6cd26-de80-4828-b0f9-ec08080ed79a	f3d191d7-7772-4b06-a36c-08c374ed117f	2026-04-02 15:51:56.4266
67f6cd26-de80-4828-b0f9-ec08080ed79a	5893676d-a7e0-4f46-8f13-a963dd08fa0d	2026-04-02 15:51:57.093023
12bbf24c-9fe5-4043-b3d8-604ca7d2413a	c4fb7aea-0eee-4527-b507-331824ff73aa	2026-04-03 12:51:32.417647
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 6, true);


--
-- Name: questions PK_08a6d4b0f49ff300bf3a0ca60ac; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY (id);


--
-- Name: votes PK_7dba3014097831ff4f063cf8ced; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT "PK_7dba3014097831ff4f063cf8ced" PRIMARY KEY (user_id, question_id);


--
-- Name: saved_jobs PK_7e2575d334b514767b5006cc5a3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT "PK_7e2575d334b514767b5006cc5a3" PRIMARY KEY (user_id, job_id);


--
-- Name: comments PK_8bf68bc960f2b69e818bdb90dcb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: comment_reactions PK_a883c2a09d16ce1d0db8b9758d4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reactions
    ADD CONSTRAINT "PK_a883c2a09d16ce1d0db8b9758d4" PRIMARY KEY (user_id, comment_id);


--
-- Name: saved_questions PK_bdb7342acbdce9338fb86ae06dd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_questions
    ADD CONSTRAINT "PK_bdb7342acbdce9338fb86ae06dd" PRIMARY KEY (user_id, question_id);


--
-- Name: jobs PK_cf0a6c42b72fcc7f7c237def345; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: users UQ_f382af58ab36057334fb262efd5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_f382af58ab36057334fb262efd5" UNIQUE ("googleId");


--
-- Name: votes FK_27be2cab62274f6876ad6a31641; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT "FK_27be2cab62274f6876ad6a31641" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: comment_reactions FK_481c40600b2ee590adb27abb0e6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reactions
    ADD CONSTRAINT "FK_481c40600b2ee590adb27abb0e6" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: votes FK_64d599e35a82d2f4396e5380811; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT "FK_64d599e35a82d2f4396e5380811" FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: saved_questions FK_7683c2483abc9013eb029a79c2a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_questions
    ADD CONSTRAINT "FK_7683c2483abc9013eb029a79c2a" FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: saved_questions FK_87914a45035b500d15395932d6e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_questions
    ADD CONSTRAINT "FK_87914a45035b500d15395932d6e" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: comments FK_8a7f0e1af904d87ccee32d4de32; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "FK_8a7f0e1af904d87ccee32d4de32" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: comment_reactions FK_dc714054fc62b698018fcb0ae37; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_reactions
    ADD CONSTRAINT "FK_dc714054fc62b698018fcb0ae37" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: questions FK_dcaac7adf4b5af7bc980ec5250e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "FK_dcaac7adf4b5af7bc980ec5250e" FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: comments FK_e6d38899c31997c45d128a8973b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "FK_e6d38899c31997c45d128a8973b" FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: jobs FK_eec67b5cfec9db98bf94612a5f7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "FK_eec67b5cfec9db98bf94612a5f7" FOREIGN KEY (posted_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: saved_jobs FK_saved_jobs_job; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT "FK_saved_jobs_job" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: saved_jobs FK_saved_jobs_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT "FK_saved_jobs_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict TwLhPFBAFniukkW2eFPX3dsgUswjpEQfvOE4fe8h57cWzIqzb3lrNaeZJJGOGRZ

