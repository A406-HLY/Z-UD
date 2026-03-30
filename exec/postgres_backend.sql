--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

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
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: branch_raw; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.branch_raw (
    branch_name character varying(255) NOT NULL,
    full_address text NOT NULL,
    longitude double precision NOT NULL,
    latitude double precision NOT NULL
);


ALTER TABLE public.branch_raw OWNER TO root;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.branches (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    full_address text NOT NULL,
    longitude double precision NOT NULL,
    latitude double precision NOT NULL,
    location public.geography(Point,4326)
);


ALTER TABLE public.branches OWNER TO root;

--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.branches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branches_id_seq OWNER TO root;

--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: consultation_transfer_employee_details; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.consultation_transfer_employee_details (
    consultation_id character varying(36) NOT NULL,
    has_representative_name boolean,
    has_company_seal boolean,
    subscriber_type character varying(30),
    latest_acquisition_date date,
    latest_loss_date character varying(20),
    work_period character varying(50),
    annual_income_total bigint
);


ALTER TABLE public.consultation_transfer_employee_details OWNER TO root;

--
-- Name: consultation_transfer_self_employed_details; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.consultation_transfer_self_employed_details (
    consultation_id character varying(36) NOT NULL,
    business_name character varying(100),
    business_registration_number character varying(30),
    income_year character varying(10),
    income_amount bigint,
    taxable_sales_amount bigint
);


ALTER TABLE public.consultation_transfer_self_employed_details OWNER TO root;

--
-- Name: consultation_transfers; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.consultation_transfers (
    consultation_id character varying(36) NOT NULL,
    employment_type character varying(50) NOT NULL,
    manual_review_required boolean,
    collateral_market_price bigint,
    total_remaining_loan_balance bigint,
    credit_rating character varying(20),
    annual_principal_and_interest_repayment bigint,
    report_input_json text
);


ALTER TABLE public.consultation_transfers OWNER TO root;

--
-- Name: consultations; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.consultations (
    id character varying(36) NOT NULL,
    user_id bigint NOT NULL,
    resident_registration_number character varying(255),
    name character varying(255),
    phone_number character varying(255),
    employment_type character varying(255),
    target_loan_amount bigint,
    loan_purpose character varying(255),
    owned_house_count integer
);


ALTER TABLE public.consultations OWNER TO root;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.customers (
    id bigint NOT NULL,
    customer_name character varying(100) NOT NULL,
    customer_email character varying(255) NOT NULL
);


ALTER TABLE public.customers OWNER TO root;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO root;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: house_official_price; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.house_official_price (
    id bigint NOT NULL,
    std_year integer NOT NULL,
    std_month smallint NOT NULL,
    legal_dong_code character varying(10) NOT NULL,
    road_address character varying(255) NOT NULL,
    sido character varying(50) NOT NULL,
    sigungu character varying(50) NOT NULL,
    eup_myeon character varying(50),
    dong_ri character varying(100),
    special_land_code character varying(10),
    lot_main_no character varying(10),
    lot_sub_no character varying(10),
    special_land_name character varying(100),
    complex_name character varying(200),
    dong_name character varying(50),
    ho_name character varying(50),
    exclusive_area numeric(10,2),
    official_price bigint NOT NULL,
    complex_code character varying(30),
    building_dong_code character varying(30),
    unit_code character varying(30)
);


ALTER TABLE public.house_official_price OWNER TO root;

--
-- Name: house_official_price_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.house_official_price_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.house_official_price_id_seq OWNER TO root;

--
-- Name: house_official_price_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.house_official_price_id_seq OWNED BY public.house_official_price.id;


--
-- Name: house_trade_price; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.house_trade_price (
    id bigint NOT NULL,
    house_type character varying(30) NOT NULL,
    sigungu character varying(200) NOT NULL,
    jibun character varying(100) NOT NULL,
    lot_main_no character varying(10),
    lot_sub_no character varying(10),
    building_name character varying(255),
    building_dong character varying(50),
    floor integer,
    exclusive_area numeric(12,4),
    land_right_area numeric(12,4),
    total_floor_area numeric(12,4),
    land_area numeric(12,4),
    road_condition character varying(100),
    contract_year_month integer NOT NULL,
    contract_day smallint NOT NULL,
    deal_amount_manwon bigint NOT NULL,
    buyer_type character varying(100),
    seller_type character varying(100),
    build_year integer,
    road_name character varying(255),
    cancel_date date,
    deal_type character varying(50),
    broker_location character varying(255),
    registry_date date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone
);


ALTER TABLE public.house_trade_price OWNER TO root;

--
-- Name: house_trade_price_apartment_raw; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.house_trade_price_apartment_raw (
    no character varying(20),
    sigungu character varying(200),
    jibun character varying(100),
    lot_main_no character varying(10),
    lot_sub_no character varying(10),
    building_name character varying(255),
    exclusive_area numeric(12,4),
    contract_year_month integer,
    contract_day smallint,
    deal_amount_manwon character varying(50),
    building_dong character varying(50),
    floor integer,
    buyer_type character varying(100),
    seller_type character varying(100),
    build_year integer,
    road_name character varying(255),
    cancel_date_raw character varying(20),
    deal_type character varying(50),
    broker_location character varying(255),
    registry_date_raw character varying(20)
);


ALTER TABLE public.house_trade_price_apartment_raw OWNER TO root;

--
-- Name: house_trade_price_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.house_trade_price_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.house_trade_price_id_seq OWNER TO root;

--
-- Name: house_trade_price_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.house_trade_price_id_seq OWNED BY public.house_trade_price.id;


--
-- Name: house_trade_price_multi_raw; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.house_trade_price_multi_raw (
    no character varying(20),
    sigungu character varying(200),
    jibun character varying(100),
    lot_main_no character varying(10),
    lot_sub_no character varying(10),
    building_name character varying(255),
    exclusive_area character varying(50),
    land_right_area character varying(50),
    contract_year_month character varying(20),
    contract_day character varying(20),
    deal_amount_manwon character varying(50),
    floor character varying(20),
    buyer_type character varying(100),
    seller_type character varying(100),
    build_year character varying(20),
    road_name character varying(255),
    cancel_date_raw character varying(20),
    deal_type character varying(50),
    broker_location character varying(255),
    registry_date_raw character varying(20)
);


ALTER TABLE public.house_trade_price_multi_raw OWNER TO root;

--
-- Name: house_trade_price_single_raw; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.house_trade_price_single_raw (
    no character varying(20),
    sigungu character varying(200),
    jibun character varying(100),
    house_type_raw character varying(50),
    road_condition character varying(100),
    total_floor_area character varying(50),
    land_area character varying(50),
    contract_year_month character varying(20),
    contract_day character varying(20),
    deal_amount_manwon character varying(50),
    buyer_type character varying(100),
    seller_type character varying(100),
    build_year character varying(20),
    road_name character varying(255),
    cancel_date_raw character varying(20),
    deal_type character varying(50),
    broker_location character varying(255)
);


ALTER TABLE public.house_trade_price_single_raw OWNER TO root;

--
-- Name: users; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    employee_number character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    branch_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO root;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.users_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO root;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: house_official_price id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.house_official_price ALTER COLUMN id SET DEFAULT nextval('public.house_official_price_id_seq'::regclass);


--
-- Name: house_trade_price id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.house_trade_price ALTER COLUMN id SET DEFAULT nextval('public.house_trade_price_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: consultation_transfer_employee_details consultation_transfer_employee_details_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.consultation_transfer_employee_details
    ADD CONSTRAINT consultation_transfer_employee_details_pkey PRIMARY KEY (consultation_id);


--
-- Name: consultation_transfer_self_employed_details consultation_transfer_self_employed_details_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.consultation_transfer_self_employed_details
    ADD CONSTRAINT consultation_transfer_self_employed_details_pkey PRIMARY KEY (consultation_id);


--
-- Name: consultation_transfers consultation_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.consultation_transfers
    ADD CONSTRAINT consultation_transfers_pkey PRIMARY KEY (consultation_id);


--
-- Name: consultations consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: house_official_price house_official_price_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.house_official_price
    ADD CONSTRAINT house_official_price_pkey PRIMARY KEY (id);


--
-- Name: house_trade_price house_trade_price_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.house_trade_price
    ADD CONSTRAINT house_trade_price_pkey PRIMARY KEY (id);


--
-- Name: users users_employee_number_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_number_key UNIQUE (employee_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_hop_road_complex_dong_ho_latest; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_hop_road_complex_dong_ho_latest ON public.house_official_price USING btree (road_address, complex_name, dong_name, ho_name, std_year DESC, std_month DESC);


--
-- Name: idx_hop_road_complex_latest; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_hop_road_complex_latest ON public.house_official_price USING btree (road_address, complex_name, std_year DESC, std_month DESC);


--
-- Name: idx_hop_road_complex_price; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_hop_road_complex_price ON public.house_official_price USING btree (road_address, complex_name, official_price);


--
-- Name: consultation_transfer_employee_details consultation_transfer_employee_details_consultation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.consultation_transfer_employee_details
    ADD CONSTRAINT consultation_transfer_employee_details_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultation_transfers(consultation_id);


--
-- Name: consultation_transfer_self_employed_details consultation_transfer_self_employed_detail_consultation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.consultation_transfer_self_employed_details
    ADD CONSTRAINT consultation_transfer_self_employed_detail_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultation_transfers(consultation_id);


--
-- Name: users users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- PostgreSQL database dump complete
--

