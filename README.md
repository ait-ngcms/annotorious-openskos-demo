# Europeana Annotorious OpenSKOS Demonstration

This is a demonstration application that provides:

* search for high-resolution images through the Europeana API (in specific collections)
* free-text annotation of images and tagging with controlled vocabulary terms

Image annotation is implemented using [Annotorious](http://annotorious.github.io). Controlled vocabulary
terms are retrieved via [OpenSKOS](http://openskos.org) API.

## Known Issues

* Only the following special characters can be used:

        . , - ( )

* Alphabetic characters outside the english alphabet are not handled