package tags

import (
	"net/http"
	"regexp"
	"sort"
	"strings"
)

const (
	nextjs              = "Next.js"
	remix               = "Remix"
	react               = "React"
	gatsby              = "Gatsby"
	angular             = "Angular"
	wix                 = "Wix"
	vue                 = "Vue"
	svelte              = "Svelte"
	svelteKit           = "SvelteKit"
	nuxt                = "Nuxt"
	webflow             = "Webflow"
	stencil             = "Stencil"
	hugo                = "Hugo"
	createReactApp      = "Create React App"
	hotwireTurbo        = "Hotwire Turbo"
	amp                 = "AMP"
	vercel              = "Vercel"
	wordpress           = "Wordpress"
	squarespace         = "Squarespace"
	swipePages          = "Swipe Pages"
	doApp               = "Digital Ocean App"
	shopify             = "Shopify"
	bubble              = "Bubble"
	flyio               = "fly.io"
	deno                = "Deno Deploy"
	cloudflare          = "Cloudflare Workers"
	akamai              = "Akamai"
	netlify             = "Netlify"
	githubPages         = "GitHub Pages"
	express             = "Express"
	aws                 = "AWS"
	awsS3               = "AWS S3"
	nginx               = "Nginx"
	apache              = "Apache"
	awsCloudfront       = "AWS Cloudfront"
	microsoftDynamics   = "Microsoft Dynamics 365 Commerce"
	salesforce          = "Salesforce Commerce Cloud"
	azure               = "Azure"
	azureCDN            = "Azure CDN"
	googleCloud         = "Google Cloud"
	heroku              = "Heroku"
	envoy               = "Envoy"
	fastly              = "Fastly"
)

func Parse(body string, header http.Header) ([]string, error) {
	tags := []string{}

	// body

	if strings.Contains(body, `id="__next""`) {
		tags = append(tags, nextjs, react)
	}

	if strings.Contains(body, "__remixContext") {
		tags = append(tags, remix, react)
	}
	if strings.Contains(body, `id="___gatsby"`) {
		tags = append(tags, gatsby, react)
	}
	if strings.Contains(body, `id="__nuxt"`) {
		tags = append(tags, nuxt, vue)
	}
	if strings.Contains(body, "data-wf-site=") {
		tags = append(tags, webflow)
	}
	if strings.Contains(body, "data-stencil-build") {
		tags = append(tags, stencil)
	}

	if strings.Contains(body, "//assets.squarespace.com") {
		tags = append(tags, squarespace)
	}

	if strings.Contains(body, "/wp-json") || strings.Contains(body, "/wp-includes/") {
		tags = append(tags, wordpress)
	}

	if strings.Contains(body, `<meta name=generator content="Hugo`) {
		tags = append(tags, hugo)
	}

	if strings.Contains(body, `<div id="svelte">`) || strings.Contains(body, "svelte-") {
		tags = append(tags, svelte)
	}

	if strings.Contains(body, "sveltekit:") {
		tags = append(tags, svelte, svelteKit)
	}

	if strings.Contains(body, "data-reactroot") {
		tags = append(tags, react)
	}

	if strings.Contains(body, `<div id="root">`) {
		tags = append(tags, createReactApp)
	}

	if strings.Contains(body, `data-server-rendered="true"`) {
		tags = append(tags, vue)
	}

	if strings.Contains(body, `<script src="runtime.`) && strings.Contains(body, `<script src="polyfills.`) {
		tags = append(tags, angular)
	}

	if strings.Contains(body, "data-turbo-track") {
		tags = append(tags, hotwireTurbo)
	}

	if regexp.MustCompile("/<html([^>]*\bamp\b|[^>]*\u26A1\uFE0F?)[^>]*>/i").Match([]byte(body)) {
		tags = append(tags, amp)
	}

	if strings.Contains(body, `src="https://scripts.swipepages.com`) {
		tags = append(tags, swipePages)
	}

	// Header

	if header.Get("x-do-app-origin") != "" {
		tags = append(tags, doApp)
	}

	if header.Get("x-wix-request-id") != "" {
		tags = append(tags, wix)
	}

	if header.Get("x-shopify-stage") != "" {
		tags = append(tags, shopify)
	}

	if header.Get("x-bubble-perf") != "" {
		tags = append(tags, bubble)
	}
	if header.Get("x-vercel-id") != "" || header.Get("server") == "Vercel" {
		tags = append(tags, vercel)
	}

	if header.Get("fly-request-id") != "" {
		tags = append(tags, flyio)
	}

	if strings.Contains(header.Get("server"), "deno/") {
		tags = append(tags, deno)
	}

	if header.Get("x-ak-protocol") != "" ||
		header.Get("server") == "AkamaiGHost" ||
		header.Get("x-akamai-transformed") != "" {
		tags = append(tags, akamai)
	}

	if header.Get("x-nf-request-id") != "" ||
		header.Get("server") == "Netlify" {
		tags = append(tags, netlify)
	}

	if header.Get("x-github-request-id") != "" {
		tags = append(tags, githubPages)
	}

	if header.Get("x-powered-by") == "Express" {
		tags = append(tags, express)
	}

	if header.Get("server") == "AmazonS3" {
		tags = append(tags, aws, awsS3)
	} else if strings.Contains(header.Get("server"), "nginx") {
		tags = append(tags, nginx)
	} else if header.Get("server") == "Apache" {
		tags = append(tags, apache)
	}

	if header.Get("x-amz-cf-id") != "" {
		tags = append(tags, aws, awsCloudfront)

	}

	// dynamics 365 commerce
	if strings.Contains(header.Get("set-cookie"), "msdyn365") ||
		strings.Contains(body, "_msdyn365") {
		tags = append(tags, microsoftDynamics)
	}
	if strings.Contains(body, "demandware.static") || strings.Contains(body, "demandware.store") {
		tags = append(tags, salesforce)
	}

	if header.Get("X-MSEdge-Ref") != "" {
		tags = append(tags, azure, azureCDN)
	}

	if header.Get("cf-ray") != "" {
		tags = append(tags, cloudflare)
	}

	if strings.ToLower(header.Get("via")) == "1.1 google" {
		tags = append(tags, googleCloud)
	}

	if strings.Contains(header.Get("via"), "vegur") {
		tags = append(tags, heroku)
	}

	if strings.Contains(header.Get("x-served-by"), "cache-") {
		tags = append(tags, fastly)
	}

	if header.Get("x-envoy-upstream-service-time") != "" {
		tags = append(tags, envoy)
	}


	deduplicated := []string{}
	deduplicationMap := map[string]bool{}
	for _, tag := range tags {
		if _, ok := deduplicationMap[tag]; !ok {
			deduplicationMap[tag] = true
			deduplicated = append(deduplicated, tag)
		}
	}
	sort.Strings(deduplicated)
	return deduplicated,nil

}
