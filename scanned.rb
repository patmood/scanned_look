class Scanned < Sinatra::Base

  configure do
    enable :sessions
    set :session_secret, "THISPROBSHOULDNTBEONGITHUBLOL"
  end

  get "/" do
    erb :index
  end

  get "/download/:filename" do |filename|
    file_path = "#{Dir.pwd}/converted/#{filename}"
    content_type :pdf
    content = File.read file_path
    File.delete(file_path)
    content
  end

  post "/upload" do
    session[:notice] = nil
    tempfile = params['myfile'][:tempfile]
    filename = params['myfile'][:filename]
    filename.gsub!(/\s/,"") if /\s/.match(filename)
    filename_stripped = filename.gsub(/\.\w+\z/,"")
    FileUtils.copy(tempfile.path, "uploads/#{filename}")

    # Check input
    if params['myfile'][:type].match(/image\/\w+/)
      pages = 1
    elsif params['myfile'][:type].match(/application\/pdf/)
      # Count pages
      pages = PDF::Reader.new("uploads/#{filename}").page_count
    else
      File.delete("#{Dir.pwd}/uploads/#{filename}")
      session[:notice] = "Must be PDF or image"
      redirect "/"
    end

    page_paths = []

    # "Scan" each page
    begin
      pages.times do |page|
        system("convert #{Dir.pwd}/uploads/#{filename}[#{page}] -mattecolor gray99 -frame 1x1+1 -colorspace gray \\( +clone -blur 0x1 \\) +swap -compose divide -resize 800 -composite -contrast-stretch 5%,0% -rotate #{rand - 0.5} #{Dir.pwd}/converted/#{filename_stripped}-#{page}-scanned.pdf")
        page_paths << "#{Dir.pwd}/converted/#{filename_stripped}-#{page}-scanned.pdf"
      end
    rescue
      File.delete("#{Dir.pwd}/uploads/#{filename}")
      session[:notice] = "Failed to scan properly :("
      redirect "/"
    end

    # Combine pages into single PDF
    begin
      system("gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=#{Dir.pwd}/converted/#{filename_stripped}-scanned.pdf #{page_paths.join(' ')}")
    rescue
      session[:notice] = "Failed to combine pages :("
      redirect "/"
    end

    # Delete scanned pages
    page_paths.each do |page|
      File.delete(page)
    end

    # Delete original upload
    File.delete("#{Dir.pwd}/uploads/#{filename}")

    # return "The file was successfully scanned! <a href='download/#{filename_stripped}-scanned.pdf'>Download!</a>"
    redirect "download/#{filename_stripped}-scanned.pdf"


  end
end
