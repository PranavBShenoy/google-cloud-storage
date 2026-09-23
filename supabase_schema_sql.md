-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
  username character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  name character varying,
  email character varying NOT NULL UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);

CREATE TABLE public.forms (
  form_id character varying NOT NULL,
  creator_id integer NOT NULL,
  title character varying NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  description text,
  design_code jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT forms_pkey PRIMARY KEY (form_id),
  CONSTRAINT forms_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id)
);

CREATE TABLE public.questions (
  question_id integer NOT NULL DEFAULT nextval('questions_question_id_seq'::regclass),
  form_id character varying NOT NULL,
  question_text text NOT NULL,
  question_type character varying DEFAULT 'text'::character varying,
  is_required boolean DEFAULT false,
  CONSTRAINT questions_pkey PRIMARY KEY (question_id),
  CONSTRAINT questions_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(form_id)
);

CREATE TABLE public.responses (
  response_id integer NOT NULL DEFAULT nextval('responses_response_id_seq'::regclass),
  form_id character varying NOT NULL,
  user_id integer NOT NULL,
  submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT responses_pkey PRIMARY KEY (response_id),
  CONSTRAINT responses_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(form_id),
  CONSTRAINT responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

CREATE TABLE public.answers (
  answer_id integer NOT NULL DEFAULT nextval('answers_answer_id_seq'::regclass),
  response_id integer NOT NULL,
  question_id integer NOT NULL,
  answer_text text,
  CONSTRAINT answers_pkey PRIMARY KEY (answer_id),
  CONSTRAINT answers_response_id_fkey FOREIGN KEY (response_id) REFERENCES public.responses(response_id),
  CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id)
);