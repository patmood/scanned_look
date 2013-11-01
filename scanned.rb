require 'sinatra'
require 'shotgun'
require 'fileutils'

get "/" do
  erb :index
end

get "/download/:filename" do |filename|
  file_path = "#{Dir.pwd}/converted/#{filename}"
  content_type :jpg
  content = File.read file_path
  File.delete(file_path)
  content
end

post "/upload" do
  p "============ PARAMS ================"
  p params
  p params['myfile'][:type] == 'image/gif'
  p params['myfile'][:type] == 'application/pdf'


  tempfile = params['myfile'][:tempfile]
  filename = params['myfile'][:filename]
  filename.gsub!(/\s/,"") if /\s/.match(filename)
  FileUtils.copy(tempfile.path, "uploads/#{filename}")

  system("convert #{Dir.pwd}/uploads/#{filename} -mattecolor gray99 -frame 1x1+1 -colorspace gray \\( +clone -blur 0x1 \\) +swap -compose divide -resize 800 -composite -contrast-stretch 5%,0% -rotate #{rand*2 - 1} #{Dir.pwd}/converted/#{filename}-scanned.jpg")
  return "The file was successfully scanned! <a href='download/#{filename}-scanned.jpg'>Download!</a>"
end


# convert test.pdf -mattecolor gray99 -frame 1x1+1 -colorspace gray \( +clone -blur 0x1 \) +swap -compose divide -resize 800 -composite -contrast-stretch 5%,0% -rotate 1 as-scanned.jpg



__END__
@@index

<h1>Scanned Look</h1>
<form action="/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="myfile">
  <input type="submit">
</form>

<h2>To Do:</h2>
<ul>
  <li>Check file type</li>
  <li>Delete files after download</li>
</ul>
