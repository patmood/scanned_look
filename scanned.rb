class Scanned < Sinatra::Base

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
    tempfile = params['myfile'][:tempfile]
    filename = params['myfile'][:filename]
    filename.gsub!(/(\.\w+\z)|\s|\W/,"")
    FileUtils.copy(tempfile.path, "uploads/#{filename}")

    # Check input
    if params['myfile'][:type].match(/image\/\w+/)
      pages = 1
    elsif params['myfile'][:type].match(/application\/pdf/)
      # Count pages
      pages = PDF::Reader.new("uploads/#{filename}").page_count
    else
      File.delete("#{Dir.pwd}/uploads/#{filename}")
      return "Must be PDF or image"
    end

    page_paths = []

    # "Scan" each page
    begin
      pages.times do |page|
        system("convert #{Dir.pwd}/uploads/#{filename}[#{page}] -mattecolor gray99 -frame 1x1+1 -colorspace gray \\( +clone -blur 0x1 \\) +swap -compose divide -resize 800 -composite -contrast-stretch 5%,0% -rotate #{rand - 0.5} #{Dir.pwd}/converted/#{filename}-#{page}-scanned.pdf")
        page_paths << "#{Dir.pwd}/converted/#{filename}-#{page}-scanned.pdf"
      end
    rescue
      File.delete("#{Dir.pwd}/uploads/#{filename}")
      return "Failed to scan properly :("
    end

    # Combine pages into single PDF
    begin
      system("gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=#{Dir.pwd}/converted/#{filename}-scanned.pdf #{page_paths.join(' ')}")
    rescue
      return "Failed to combine pages :("
    end

    # Delete scanned pages
    p page_paths
    page_paths.each do |page|
      File.delete(page)
    end

    # Delete original upload
    File.delete("#{Dir.pwd}/uploads/#{filename}")

    return "The file was successfully scanned! <a href='download/#{filename}-scanned.pdf'>Download!</a>"
    # redirect "download/#{filename}-scanned.pdf"


  end
end
