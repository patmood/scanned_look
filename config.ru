require 'rubygems'
require 'sinatra'
require 'shotgun'
require 'fileutils'
require 'pdf-reader'

require File.expand_path '../scanned.rb', __FILE__

run Scanned
